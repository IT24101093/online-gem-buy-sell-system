package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.*;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.*;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SmartAnalysisEngineService {

    private static final BigDecimal DEFAULT_SG = new BigDecimal("3.9000");
    private static final BigDecimal DEFAULT_SHAPE_FACTOR = new BigDecimal("0.30");
    private static final BigDecimal DEFAULT_YIELD_PERCENT = new BigDecimal("45.00");
    private static final BigDecimal WARNING_THRESHOLD = new BigDecimal("15.0");

    private final SpecificGravityRepository specificGravityRepository;
    private final ShapeFactorRepository shapeFactorRepository;
    private final YieldFactorRepository yieldFactorRepository;
    private final BasePricePerCaratRepository basePricePerCaratRepository;
    private final MultiplierRepository multiplierRepository;

    public SmartAnalysisRunResponseDto run(SmartAnalysisRunRequestDto dto) {

        if (dto.getConfirmedGemType() == null || dto.getConfirmedGemType().isBlank()) {
            throw new RuntimeException("confirmedGemType is required");
        }
        if (dto.getLengthMm() == null || dto.getWidthMm() == null || dto.getDepthMm() == null) {
            throw new RuntimeException("lengthMm, widthMm, depthMm are required");
        }

        BigDecimal volumeMm3 = dto.getLengthMm()
                .multiply(dto.getWidthMm())
                .multiply(dto.getDepthMm())
                .setScale(4, RoundingMode.HALF_UP);

        BigDecimal sg = specificGravityRepository.findByMaterialIgnoreCase(dto.getConfirmedGemType())
                .map(SpecificGravity::getSgValue)
                .orElse(DEFAULT_SG);

        BigDecimal shapeFactor = (dto.getRoughShape() == null || dto.getRoughShape().isBlank())
                ? DEFAULT_SHAPE_FACTOR
                : shapeFactorRepository.findByShapeIgnoreCase(dto.getRoughShape())
                .map(ShapeFactor::getFactor)
                .orElse(DEFAULT_SHAPE_FACTOR);

        // consistent formula (same as your Day 10)
        BigDecimal estimatedCarat = volumeMm3
                .multiply(sg)
                .multiply(shapeFactor)
                .divide(new BigDecimal("200"), 3, RoundingMode.HALF_UP);

        BigDecimal finalWeightCt = estimatedCarat;
        boolean warningTriggered = false;
        String warningMessage = null;
        BigDecimal diffPercent = null;

        if (Boolean.TRUE.equals(dto.getManualWeightOn()) && dto.getManualWeightCt() != null) {
            finalWeightCt = dto.getManualWeightCt();

            diffPercent = dto.getManualWeightCt().subtract(estimatedCarat).abs()
                    .multiply(new BigDecimal("100"))
                    .divide(estimatedCarat.max(new BigDecimal("0.001")), 2, RoundingMode.HALF_UP);

            if (diffPercent.compareTo(WARNING_THRESHOLD) >= 0) {
                warningTriggered = true;
                warningMessage = "Manual weight differs from estimated weight by " + diffPercent + "% (>= 15%).";
            }
        }

        BigDecimal baseYield = (dto.getRoughShape() == null || dto.getRoughShape().isBlank())
                ? DEFAULT_YIELD_PERCENT
                : yieldFactorRepository.findByRoughShapeIgnoreCase(dto.getRoughShape())
                .map(YieldFactor::getYieldPercent)
                .orElse(DEFAULT_YIELD_PERCENT);

        BigDecimal basePricePerCarat = pickBasePrice(dto.getConfirmedGemType(), finalWeightCt);

        BigDecimal mColor = lookupMultiplier(Multiplier.Category.COLOR, dto.getColorGrade());
        BigDecimal mClarity = lookupMultiplier(Multiplier.Category.CLARITY, dto.getClarityGrade());
        BigDecimal mCut = lookupMultiplier(Multiplier.Category.CUT, dto.getCutGrade());

        BigDecimal adjustedPricePerCarat = basePricePerCarat
                .multiply(mColor).multiply(mClarity).multiply(mCut)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal estimatedValue = adjustedPricePerCarat.multiply(finalWeightCt)
                .setScale(2, RoundingMode.HALF_UP);

        // 3 cut options (same yield source, as your rule says; recommended by cutValue)
        List<CutOptionDto> cuts = new ArrayList<>();
        String bestCut = null;
        BigDecimal bestValue = new BigDecimal("-1");

        for (String cut : List.of("Round", "Oval", "Emerald")) {

            // Get yield% from DB for THIS cut shape (Round/Oval/Emerald)
            BigDecimal yieldPercent = yieldFactorRepository.findByRoughShapeIgnoreCase(cut)
                    .map(YieldFactor::getYieldPercent)
                    .orElse(new BigDecimal("45.00")); // default if missing

            BigDecimal yieldCt = finalWeightCt.multiply(yieldPercent)
                    .divide(new BigDecimal("100"), 3, RoundingMode.HALF_UP);

            BigDecimal cutValue = yieldCt.multiply(adjustedPricePerCarat)
                    .setScale(2, RoundingMode.HALF_UP);

            boolean isBest = cutValue.compareTo(bestValue) > 0;
            if (isBest) {
                bestValue = cutValue;
                bestCut = cut;
            }

            cuts.add(new CutOptionDto(cut, yieldPercent, yieldCt, cutValue, false));
        }

        for (CutOptionDto c : cuts) {
            if (Objects.equals(c.getCutShape(), bestCut)) c.setRecommended(true);
        }

        return new SmartAnalysisRunResponseDto(
                dto.getConfirmedGemType(),
                sg,
                shapeFactor,
                volumeMm3,
                estimatedCarat,
                finalWeightCt,
                warningTriggered,
                warningMessage,
                diffPercent,
                basePricePerCarat,
                mColor,
                mClarity,
                mCut,
                adjustedPricePerCarat,
                estimatedValue,
                cuts,
                bestCut,
                "Analysis successful"

        );
    }

    private BigDecimal lookupMultiplier(Multiplier.Category category, String gradeCode) {
        if (gradeCode == null || gradeCode.isBlank()) return BigDecimal.ONE;
        return multiplierRepository.findByCategoryAndGradeCodeIgnoreCase(category, gradeCode)
                .map(Multiplier::getMultiplierValue)
                .orElse(BigDecimal.ONE);
    }

    private BigDecimal pickBasePrice(String gemType, BigDecimal carat) {
        List<BasePricePerCarat> rows = base_price_rows(gemType);
        if (rows.isEmpty()) return BigDecimal.ZERO;

        for (BasePricePerCarat r : rows) {
            if (carat.compareTo(r.getMinCarat()) >= 0 && carat.compareTo(r.getMaxCarat()) <= 0) {
                return r.getBasePriceLkr();
            }
        }

        rows.sort(Comparator.comparing(BasePricePerCarat::getMinCarat));
        return rows.get(rows.size() - 1).getBasePriceLkr();
    }

    private List<BasePricePerCarat> base_price_rows(String gemType) {
        return basePricePerCaratRepository.findByGemTypeIgnoreCase(gemType);
    }
}