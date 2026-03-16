package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.PredictionItemDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisDetectResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SmartAnalysisDetectService {

    private final RestTemplate restTemplate;

    @Value("${ai.predict.base-url}")
    private String aiBaseUrl;

    public SmartAnalysisDetectResponseDto detect(MultipartFile file) {
        validateImage(file);

        try {
            // create file resource from uploaded multipart file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            // multipart body: key name must be "file" to match FastAPI
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            // headers for the file part
            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE
            ));

            // wrap the file with headers
            HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(fileResource, fileHeaders);

            // rebuild body with wrapped file entity
            MultiValueMap<String, Object> multipartBody = new LinkedMultiValueMap<>();
            multipartBody.add("file", fileEntity);

            // request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(multipartBody, headers);

            // call FastAPI /predict
            ResponseEntity<Map> response = restTemplate.exchange(
                    aiBaseUrl + "/predict",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return mapResponse(response.getBody());

        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded image file", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI prediction service", e);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
        }
    }

    private SmartAnalysisDetectResponseDto mapResponse(Map body) {
        if (body == null) {
            throw new RuntimeException("AI prediction service returned an empty response");
        }

        String detectedGemType = (String) body.get("detectedGemType");
        BigDecimal confidenceScore = toBigDecimal(body.get("confidenceScore"));

        List<PredictionItemDto> top3 = new ArrayList<>();
        Object top3Obj = body.get("top3Predictions");

        if (top3Obj instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    String gemType = (String) map.get("gemType");
                    BigDecimal confidence = toBigDecimal(map.get("confidence"));
                    top3.add(new PredictionItemDto(gemType, confidence));
                }
            }
        }

        return new SmartAnalysisDetectResponseDto(
                detectedGemType,
                confidenceScore,
                top3
        );
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }
}