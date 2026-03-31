package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceDraftDTO {
    private Long draftId;
    private Long inventoryItemId;     // REQUIRED: Used in marketplace-admin.js to show the ID
    private String gemstoneName;
    private String category;
    private String spec;              // e.g. "2.50ct Sapphire"
    private BigDecimal suggestedPriceLkr; // MATCH JS: Your JS uses 'suggestedPriceLkr'
    private String status;            // REQUIRED: marketplace-admin.js filters by item.status === 'PENDING'
    private String mainImageUrl;
}