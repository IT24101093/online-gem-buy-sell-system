package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryImageResponseDto {
    private Long imageId;
    private Long inventoryItemId;
    private Boolean isPrimary;
    private Integer sortOrder;
    private String imagePath;
    private String imageUrl;
}