package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SmartAnalysisSaveResponseDto {
    private Long inventoryItemId;
    private String inventoryCode;
    private String source;

    private String gemType;
    private BigDecimal weightCt;
    private BigDecimal estimatedValueLkr;

    private Long reportId;

    private String recommendedCut;
    private Boolean warningTriggered;
    private String warningMessage;


    private String description;

    private String message;
}