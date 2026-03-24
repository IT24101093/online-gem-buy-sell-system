package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.*;

/**
 * SuggestionRequestDTO – request body for POST /api/gems/suggest
 *
 * Fields mirror the frontend suggestion modal dropdowns:
 *   - jewelleryType  : "Ring" | "Pendant" | "Necklace" | "Earrings" | "Bracelet" | "all"
 *   - preferredColor : "blue" | "yellow" | "pink" | "green" | "red" | "all"
 *   - budgetRange    : "under_1m" | "1m_2m" | "2m_3m" | "above_3m" | "all"
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionRequestDTO {
    private String jewelleryType;
    private String preferredColor;
    private String budgetRange;
}
