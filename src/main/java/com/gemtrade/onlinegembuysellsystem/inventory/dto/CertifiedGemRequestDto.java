package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CertifiedGemRequestDto {

    private String gemType;
    private String category;
    private BigDecimal weightCt;
    private BigDecimal estimatedValueLkr;
    private String description;

    private String certificateNo;
    private String labName;
    private LocalDate issueDate;
    private String reportUrl;

    private SellerRequestDto seller;
}