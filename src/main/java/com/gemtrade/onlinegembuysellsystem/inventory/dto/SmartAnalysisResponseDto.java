package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SmartAnalysisResponseDto {
    private Long inventoryItemId;
    private String inventoryCode;
    private String source;

    private String gemType;
    private BigDecimal weightCt;

    private Long reportId;
    private String detectedGemType;
    private BigDecimal confidenceScore;

    // Calculation outputs (Day 10)
    private BigDecimal specificGravityUsed;
    private BigDecimal shapeFactorUsed;
    private BigDecimal volumeMm3;
    private BigDecimal estimatedCarat;

    // Warning outputs (Day 10)
    private Boolean warningTriggered;
    private String warningMessage;
    private BigDecimal differencePercent;

    // URL to the primary image (null until an image is uploaded in step 2)
    private String primaryImageUrl;

    private String message;



}