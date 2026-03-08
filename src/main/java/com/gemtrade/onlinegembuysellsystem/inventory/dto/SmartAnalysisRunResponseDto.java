package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class SmartAnalysisRunResponseDto {
    private String confirmedGemType;

    private BigDecimal specificGravityUsed;
    private BigDecimal shapeFactorUsed;
    private BigDecimal volumeMm3;
    private BigDecimal estimatedCarat;
    private BigDecimal finalWeightCt;

    private Boolean warningTriggered;
    private String warningMessage;
    private BigDecimal differencePercent;

    private BigDecimal basePricePerCarat;
    private BigDecimal mColor;
    private BigDecimal mClarity;
    private BigDecimal mCut;
    private BigDecimal adjustedPricePerCarat;

    private BigDecimal estimatedValueLkr; // adjustedPricePerCarat * finalWeightCt

    private List<CutOptionDto> cutOptions;
    private String recommendedCut;
}