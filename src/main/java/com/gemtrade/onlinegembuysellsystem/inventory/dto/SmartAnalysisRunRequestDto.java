package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SmartAnalysisRunRequestDto {
    private String detectedGemType;
    private BigDecimal confidenceScore;

    private String confirmedGemType;

    private BigDecimal lengthMm;
    private BigDecimal widthMm;
    private BigDecimal depthMm;

    private String roughShape;

    private Boolean manualWeightOn;
    private BigDecimal manualWeightCt;

    private String colorGrade;
    private String clarityGrade;
    private String cutGrade;

    private String rawJson;
}