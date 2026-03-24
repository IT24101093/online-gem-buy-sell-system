package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder
public class MarketplaceDraftDTO {
    private Long draftId;
    private String gemstoneName;
    private String category;
    private String spec;           // e.g. "2.50ct Sapphire"
    private BigDecimal suggestedPrice;
}

