package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder
public class GemListingDTO {
    private Long listingId;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String mainImageUrl;
    private String colorTone;
    private Double caratWeight;     // from inventory item weight
    private String origin;          // country of origin
    private List<GemVariantDTO> variants;  // carat-wise pricing options
}
