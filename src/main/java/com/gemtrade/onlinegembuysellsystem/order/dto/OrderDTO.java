package com.gemtrade.onlinegembuysellsystem.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderDTO {

    private Long customerId;
    private Long cartId;
    private Long inventoryId;
    private Long inventoryItemId;
    private Long deliveryServiceId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "0.00")
    private BigDecimal deliveryFee;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "0.00")
    private BigDecimal insuranceFee;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "0.00")
    private BigDecimal totalAmountLkr;

    // Removed the "private String Insurance" field because it was causing
    // the "Insurance: null" duplicate in your JSON output.
    // Use the fields below if you need to store the NAME of the provider.
    private String courierName;
    private String insuranceProvider;

    private String paymentMethod;
}