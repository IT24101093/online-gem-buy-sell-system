package com.gemtrade.onlinegembuysellsystem.order.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public class OrderDTO {
    private Long customerId;
    @Getter
    @Setter
    private Long deliveryServiceId;
    @Getter
    @Setter
    private BigDecimal deliveryFee;
    @Getter
    @Setter
    private BigDecimal insuranceFee;

    @Getter
    @Setter
    private BigDecimal totalAmountLkr;
    private String CourierType;
    @Getter
    @Setter
    private String Insurance;

    @Getter
    @Setter
    private Long inventoryId;

}