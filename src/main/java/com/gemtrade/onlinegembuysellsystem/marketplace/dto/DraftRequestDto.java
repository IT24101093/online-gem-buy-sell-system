package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftRequestDto {
    private Long inventoryItemId;
    private String gemstoneName;
    private String category;
    private String descriptionSnapshot;
    private BigDecimal suggestedPriceLkr;
}