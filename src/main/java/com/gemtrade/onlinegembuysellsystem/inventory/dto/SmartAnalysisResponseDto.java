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

    private String message;
}