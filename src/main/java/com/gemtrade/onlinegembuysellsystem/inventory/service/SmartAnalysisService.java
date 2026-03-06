package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.SellerRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.Seller;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.SellerRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.ValidationReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SmartAnalysisService {

    private final SellerRepository sellerRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ValidationReportRepository validationReportRepository;

    @Transactional
    public SmartAnalysisResponseDto addAnalysisGem(SmartAnalysisRequestDto dto) {

        // Required validation (simple)
        if (dto.getSeller() == null || dto.getSeller().getNic() == null || dto.getSeller().getNic().isBlank()) {
            throw new RuntimeException("Seller NIC is required");
        }
        if (dto.getDetectedGemType() == null || dto.getDetectedGemType().isBlank()) {
            throw new RuntimeException("detectedGemType is required");
        }

        Seller seller = getOrCreateSeller(dto.getSeller());

        // --- Create InventoryItem (source=ANALYSIS) ---
        InventoryItem item = new InventoryItem();
        item.setInventoryCode(generateInventoryCode());
        item.setSource(InventoryItem.Source.ANALYSIS);

        // DB requires gem_type NOT NULL
        item.setGemType(dto.getDetectedGemType());
        item.setCategory(dto.getCategory());
        item.setStatus(InventoryItem.Status.IN_STOCK);

        BigDecimal weight = dto.getWeightCt() != null ? dto.getWeightCt() : dto.getEstimatedCarat();
        item.setWeightCt(weight);

        // description: manual preferred, else generated
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            item.setDescription(dto.getDescription());
            item.setDescriptionMode(InventoryItem.DescriptionMode.MANUAL);
        } else if (dto.getGeneratedDescription() != null && !dto.getGeneratedDescription().isBlank()) {
            item.setDescription(dto.getGeneratedDescription());
            item.setDescriptionMode(InventoryItem.DescriptionMode.AUTO);
        }

        item.setSeller(seller);
        InventoryItem savedItem = inventoryItemRepository.save(item);

        // --- Create ValidationReport linked to item ---
        ValidationReport report = new ValidationReport();
        report.setInventoryItem(savedItem);

        // DB requires color_tone NOT NULL
        report.setColorTone(parseColorTone(dto.getColorTone()));

        // Mock AI values passed from frontend
        report.setDetectedGemType(dto.getDetectedGemType());
        report.setConfidenceScore(dto.getConfidenceScore());

        report.setSpecificGravity(dto.getSpecificGravity());
        report.setVolumeMm3(dto.getVolumeMm3());
        report.setEstimatedCarat(dto.getEstimatedCarat());
        report.setYieldPercent(dto.getYieldPercent());
        report.setGeneratedDescription(dto.getGeneratedDescription());
        report.setRawJson(dto.getRawJson());

        ValidationReport savedReport = validationReportRepository.save(report);

        return new SmartAnalysisResponseDto(
                savedItem.getInventoryItemId(),
                savedItem.getInventoryCode(),
                savedItem.getSource().name(),
                savedItem.getGemType(),
                savedItem.getWeightCt(),
                savedReport.getReportId(),
                savedReport.getDetectedGemType(),
                savedReport.getConfidenceScore(),
                "Smart analysis gem saved successfully"
        );
    }

    private Seller getOrCreateSeller(SellerRequestDto sellerDto) {
        Optional<Seller> existing = sellerRepository.findByNic(sellerDto.getNic());
        if (existing.isPresent()) return existing.get();

        Seller seller = new Seller();
        seller.setName(sellerDto.getName());
        seller.setNic(sellerDto.getNic());
        seller.setPhone(sellerDto.getPhone());
        return sellerRepository.save(seller);
    }

    private String generateInventoryCode() {
        long count = inventoryItemRepository.count() + 1;
        return String.format("INV%05d", count);
    }

    private ValidationReport.ColorTone parseColorTone(String value) {
        if (value == null || value.isBlank()) return ValidationReport.ColorTone.OTHER;
        try {
            return ValidationReport.ColorTone.valueOf(value.toUpperCase());
        } catch (Exception e) {
            return ValidationReport.ColorTone.OTHER;
        }
    }
}