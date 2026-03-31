package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.*;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisDetectService;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisEngineService;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisSaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/inventory/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmartAnalysisControllerV2 {

    private final SmartAnalysisEngineService engine;
    private final SmartAnalysisSaveService saveService;
    private final SmartAnalysisDetectService detectService;

    @PostMapping(
            value = "/detect",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<SmartAnalysisDetectResponseDto> detect(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(detectService.detect(file)); // accept physical image
    }

    @PostMapping("/run")
    public ResponseEntity<SmartAnalysisRunResponseDto> run(@RequestBody SmartAnalysisRunRequestDto dto) {
        return ResponseEntity.ok(engine.run(dto)); // allow user to preview calculation
    }

    @PostMapping("/save")
    public ResponseEntity<SmartAnalysisSaveResponseDto> save(@RequestBody SmartAnalysisSaveRequestDto dto) {
        return ResponseEntity.ok(saveService.save(dto));
    }
}