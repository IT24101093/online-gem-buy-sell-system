package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmartAnalysisDetectResponseDto {
    private String detectedGemType;
    private BigDecimal confidenceScore;
    private List<PredictionItemDto> top3Predictions;
}