package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CutOptionDto {
    private String cutShape;
    private BigDecimal yieldPercent;
    private BigDecimal yieldCt;
    private BigDecimal cutValueLkr;
    private Boolean recommended;
}