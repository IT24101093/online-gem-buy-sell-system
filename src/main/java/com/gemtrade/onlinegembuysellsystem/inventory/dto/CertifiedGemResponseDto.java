package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CertifiedGemResponseDto {
    private Long inventoryItemId;
    private String inventoryCode;
    private String gemType;
    private String source;
    private String sellerName;
    private String certificateNo;
    private String message;
}