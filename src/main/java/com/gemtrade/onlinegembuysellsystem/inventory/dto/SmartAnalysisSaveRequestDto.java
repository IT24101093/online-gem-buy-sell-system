package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.Data;

@Data
public class SmartAnalysisSaveRequestDto {
    private SellerRequestDto seller;

    private String category;
    private String description;

    private SmartAnalysisRunRequestDto analysis;

    private String selectedCutShape; // optional override
}