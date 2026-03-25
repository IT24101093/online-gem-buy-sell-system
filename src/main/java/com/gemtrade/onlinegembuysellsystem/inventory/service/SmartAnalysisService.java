package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.SellerRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.*;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SmartAnalysisService {

    private static final BigDecimal DEFAULT_SG = new BigDecimal("3.9000");
    private static final BigDecimal DEFAULT_SHAPE_FACTOR = new BigDecimal("0.30");
    private static final BigDecimal WARNING_THRESHOLD_PERCENT = new BigDecimal("15.0");

    // (Optional) gemType -> material mapping if your specific_gravity table uses material groups
    private static final Map<String, String> GEMTYPE_TO_MATERIAL = Map.of(
            "Blue Sapphire", "Corundum",
            "Ruby", "Corundum"
    );

    private final SellerRepository sellerRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ValidationReportRepository validationReportRepository;

    private final SpecificGravityRepository specificGravityRepository;
    private final ShapeFactorRepository shapeFactorRepository;
    // Used to read the primary image URL (if an image exists for this item)
    private final InventoryImageRepository inventoryImageRepository;

    @Transactional
    public SmartAnalysisResponseDto addAnalysisGem(SmartAnalysisRequestDto dto) {

        // ---- Basic validations (keep simple) ----
        if (dto.getSeller() == null || dto.getSeller().getNic() == null || dto.getSeller().getNic().isBlank()) {
            throw new RuntimeException("Seller NIC is required");
        }
        if (dto.getDetectedGemType() == null || dto.getDetectedGemType().isBlank()) {
            throw new RuntimeException("detectedGemType is required");
        }

        // For Day 10 logic, dimensions are required to calculate estimated carat
        if (dto.getLengthMm() == null || dto.getWidthMm() == null || dto.getDepthMm() == null) {
            throw new RuntimeException("lengthMm, widthMm, depthMm are required");
        }

        Seller seller = getOrCreateSeller(dto.getSeller());

        // ---- 1) Look up SG by gem type (or mapped material) ----
        BigDecimal sgUsed = lookupSpecificGravity(dto.getDetectedGemType());

        // ---- 2) Look up shape factor by selected shape (or default) ----
        BigDecimal shapeFactorUsed = lookupShapeFactor(dto.getShape());

        // ---- 3) Calculate volume mm3 ----
        BigDecimal volumeMm3 = dto.getLengthMm()
                .multiply(dto.getWidthMm())
                .multiply(dto.getDepthMm())
                .setScale(4, RoundingMode.HALF_UP);

        // ---- 4) Calculate estimated carat ----
        // estimatedCarat = (volumeMm3 * sg * shapeFactor) / 200
        BigDecimal estimatedCarat = volumeMm3
                .multiply(sgUsed)
                .multiply(shapeFactorUsed)
                .divide(new BigDecimal("200"), 3, RoundingMode.HALF_UP);

        // ---- 5) Manual weight warning logic (>= 15%) ----
        boolean warningTriggered = false;
        String warningMessage = null;
        BigDecimal diffPercent = null;

        if (dto.getManualWeightCt() != null) {
            diffPercent = calculateDifferencePercent(dto.getManualWeightCt(), estimatedCarat);

            if (diffPercent.compareTo(WARNING_THRESHOLD_PERCENT) >= 0) {
                warningTriggered = true;
                warningMessage = "Manual weight differs from estimated weight by "
                        + diffPercent.setScale(1, RoundingMode.HALF_UP)
                        + "% (>= 15%).";
            }
        }

        // ---- Save InventoryItem (source=ANALYSIS) ----
        InventoryItem item = new InventoryItem();
        item.setInventoryCode(generateInventoryCode());
        item.setSource(InventoryItem.Source.ANALYSIS);
        item.setGemType(dto.getDetectedGemType());
        item.setCategory(dto.getCategory());
        item.setStatus(InventoryItem.Status.IN_STOCK);
        item.setSeller(seller);

        // Choose what to store in inventory_item.weightCt:
        // 1) manualWeightCt if provided, else 2) weightCt if provided, else 3) estimatedCarat
        BigDecimal finalWeightCt = dto.getManualWeightCt() != null
                ? dto.getManualWeightCt()
                : (dto.getWeightCt() != null ? dto.getWeightCt() : estimatedCarat);

        item.setWeightCt(finalWeightCt);

        // description: manual preferred, else generated
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            item.setDescription(dto.getDescription());
            item.setDescriptionMode(InventoryItem.DescriptionMode.MANUAL);
        } else if (dto.getGeneratedDescription() != null && !dto.getGeneratedDescription().isBlank()) {
            item.setDescription(dto.getGeneratedDescription());
            item.setDescriptionMode(InventoryItem.DescriptionMode.AUTO);
        }

        InventoryItem savedItem = inventoryItemRepository.save(item);

        // Try to get the primary image URL. It will be empty (null) until the image upload step is done.
        String primaryUrl = inventoryImageRepository
                .findFirstByInventoryItem_InventoryItemIdAndIsPrimaryTrue(savedItem.getInventoryItemId())
                .map(InventoryImage::getImageUrl)
                .orElse(null);

        // ---- Save ValidationReport ----
        ValidationReport report = new ValidationReport();
        report.setInventoryItem(savedItem);
        report.setColorTone(parseColorTone(dto.getColorTone()));

        // mocked AI fields from frontend
        report.setDetectedGemType(dto.getDetectedGemType());
        report.setConfidenceScore(dto.getConfidenceScore());

        // calculated fields (Day 10)
        report.setSpecificGravity(sgUsed);
        report.setVolumeMm3(volumeMm3);
        report.setEstimatedCarat(estimatedCarat);

        // optionally store yieldPercent if dto includes it
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
                sgUsed,
                shapeFactorUsed,
                volumeMm3,
                estimatedCarat,
                warningTriggered,
                warningMessage,
                diffPercent,
                primaryUrl,
                "Smart analysis gem saved successfully"
        );
    }

    private BigDecimal lookupSpecificGravity(String gemType) {
        // Try direct match first
        Optional<SpecificGravity> direct = specificGravityRepository.findByMaterialIgnoreCase(gemType);
        if (direct.isPresent()) return direct.get().getSgValue();

        // Try mapped material (optional)
        String mapped = GEMTYPE_TO_MATERIAL.get(gemType);
        if (mapped != null) {
            Optional<SpecificGravity> mappedRow = specificGravityRepository.findByMaterialIgnoreCase(mapped);
            if (mappedRow.isPresent()) return mappedRow.get().getSgValue();
        }

        return DEFAULT_SG;
    }

    private BigDecimal lookupShapeFactor(String shape) {
        if (shape == null || shape.isBlank()) return DEFAULT_SHAPE_FACTOR;
        return shapeFactorRepository.findByShapeIgnoreCase(shape)
                .map(ShapeFactor::getFactor)
                .orElse(DEFAULT_SHAPE_FACTOR);
    }

    private BigDecimal calculateDifferencePercent(BigDecimal manual, BigDecimal estimated) {
        if (estimated == null || estimated.compareTo(BigDecimal.ZERO) <= 0) return new BigDecimal("0.0");

        BigDecimal diff = manual.subtract(estimated).abs();
        return diff.multiply(new BigDecimal("100"))
                .divide(estimated, 2, RoundingMode.HALF_UP);
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