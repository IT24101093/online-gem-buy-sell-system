package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class InventoryItemResponseDto {
    private Long inventoryItemId;
    private String inventoryCode;
    private String source;
    private String gemType;
    private String category;
    private BigDecimal weightCt;
    private BigDecimal estimatedValueLkr;
    private String description;
    private String status;
    private String sellerName;
}