package com.gemtrade.onlinegembuysellsystem.order.dto;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class OrderRequest {
    // These individual fields are likely old or redundant now
    // since you are using CustomerDTO and OrderDTO.

    @Valid // <--- THIS IS THE KEY: It tells Spring to check rules inside CustomerDTO
    private CustomerDTO customerDTO;

    private OrderDTO orderDTO;

    // For Sir's Modification: keeping these if your logic still uses them
    private String deliveryType;
    private Long insuranceAgentId;
}