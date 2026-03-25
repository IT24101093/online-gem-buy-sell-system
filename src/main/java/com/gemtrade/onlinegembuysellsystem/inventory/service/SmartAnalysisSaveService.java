package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.*;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.*;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SmartAnalysisSaveService {

    private final SellerRepository sellerRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ValidationReportRepository validationReportRepository;

    private final SmartAnalysisEngineService engine;

    @Transactional
    public SmartAnalysisSaveResponseDto save(SmartAnalysisSaveRequestDto req) {

        if (req.getSeller() == null || req.getSeller().getNic() == null || req.getSeller().getNic().isBlank()) {
            throw new RuntimeException("Seller NIC is required");
        }
        if (req.getAnalysis() == null) {
            throw new RuntimeException("analysis is required");
        }

        // compute everything using the same logic as /run
        SmartAnalysisRunResponseDto run = engine.run(req.getAnalysis());

        // choose cut (user override or recommended)
        String chosenCut = (req.getSelectedCutShape() != null && !req.getSelectedCutShape().isBlank())
                ? req.getSelectedCutShape()
                : run.getRecommendedCut();

        CutOptionDto chosen = run.getCutOptions().stream()
                .filter(c -> c.getCutShape().equalsIgnoreCase(chosenCut))
                .findFirst()
                .orElse(run.getCutOptions().stream().filter(CutOptionDto::getRecommended).findFirst().orElse(run.getCutOptions().get(0)));

        Seller seller = getOrCreateSeller(req.getSeller());

        InventoryItem item = new InventoryItem();
        item.setInventoryCode(generateInventoryCode());
        item.setSource(InventoryItem.Source.ANALYSIS);
        item.setGemType(run.getConfirmedGemType());
        item.setCategory(req.getCategory());
        item.setWeightCt(run.getFinalWeightCt());
        item.setEstimatedValueLkr(chosen.getCutValueLkr());
        item.setStatus(InventoryItem.Status.IN_STOCK);
        item.setSeller(seller);

        // --- START OF PROFESSIONAL FIX ---

        // --- THE ACTUAL FIX ---

        // 1. Force the mode to AUTO
        item.setDescriptionMode(InventoryItem.DescriptionMode.AUTO);

        // 2. Grab the description that was generated on the frontend JS
        if (req.getDescription() != null && !req.getDescription().trim().isEmpty()) {
            item.setDescription(req.getDescription());
        } else {
            // Fallback just in case JS sends nothing
            String gemName = run.getConfirmedGemType() != null ? run.getConfirmedGemType() : "Unknown Gem";
            String caratWeight = run.getFinalWeightCt() != null ? run.getFinalWeightCt().toString() : "0.00";
            item.setDescription("Smart Analysis: " + gemName + " (" + caratWeight + " ct).");
        }

        // 3. Update the timestamp
        item.setDescriptionUpdatedAt(java.time.LocalDateTime.now());

        // 4. Save the item
        InventoryItem savedItem = inventoryItemRepository.save(item);

        // --- END OF FIX ---

        // --- END OF PROFESSIONAL FIX ---

        ValidationReport report = new ValidationReport();
        report.setInventoryItem(savedItem);
        report.setColorTone(ValidationReport.ColorTone.OTHER);

        report.setDetectedGemType(req.getAnalysis().getDetectedGemType());
        report.setConfidenceScore(req.getAnalysis().getConfidenceScore());

        report.setSpecificGravity(run.getSpecificGravityUsed());
        report.setVolumeMm3(run.getVolumeMm3());
        report.setEstimatedCarat(run.getEstimatedCarat());
        report.setYieldPercent(chosen.getYieldPercent());

        report.setRawJson(req.getAnalysis().getRawJson());
        report.setGeneratedDescription(savedItem.getDescription());

        ValidationReport savedReport = validationReportRepository.save(report);

        return new SmartAnalysisSaveResponseDto(
                savedItem.getInventoryItemId(),
                savedItem.getInventoryCode(),
                savedItem.getSource().name(),
                savedItem.getGemType(),
                savedItem.getWeightCt(),
                savedItem.getEstimatedValueLkr(),
                savedReport.getReportId(),
                run.getRecommendedCut(),
                run.getWarningTriggered(),
                run.getWarningMessage(),
                savedItem.getDescription(),
                "Saved. Upload image using POST /api/inventory/items/{itemId}/images"
        );
    }

    private Seller getOrCreateSeller(SellerRequestDto dto) {
        Optional<Seller> existing = sellerRepository.findByNic(dto.getNic());
        if (existing.isPresent()) return existing.get();

        Seller s = new Seller();
        s.setName(dto.getName());
        s.setNic(dto.getNic());
        s.setPhone(dto.getPhone());
        return sellerRepository.save(s);
    }

    private String generateInventoryCode() {
        long count = inventoryItemRepository.count() + 1;
        return String.format("INV%05d", count);
    }
}