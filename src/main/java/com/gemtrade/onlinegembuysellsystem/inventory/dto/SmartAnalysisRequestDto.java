package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SmartAnalysisRequestDto {

    // --- InventoryItem ---
    private String category;          // optional
    private BigDecimal weightCt;      // optional (fallback to estimatedCarat)
    private String description;       // optional

    // --- ValidationReport ---
    private String colorTone;         // "BLUE", "YELLOW", "PINK", "GREEN", "OTHER"
    private String detectedGemType;   // REQUIRED (also used for inventory_item.gem_type)
    private BigDecimal confidenceScore;

    private BigDecimal specificGravity;
    private BigDecimal volumeMm3;
    private BigDecimal estimatedCarat;
    private BigDecimal yieldPercent;

    private String generatedDescription;
    private String rawJson;           // store JSON as String for now

    // --- Seller ---
    private SellerRequestDto seller;  // reuse NIC logic

    // UI calculation inputs
    private String shape;           // e.g., "Round", "Oval", "Emerald"
    private BigDecimal lengthMm;
    private BigDecimal widthMm;
    private BigDecimal depthMm;
    private BigDecimal manualWeightCt; // optional (if toggle ON)
}