package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DraftRequestDto {
    private Long inventoryItemId;
    private String gemstoneName;
    private String category;
    private String descriptionSnapshot;
    private BigDecimal suggestedPriceLkr;
}