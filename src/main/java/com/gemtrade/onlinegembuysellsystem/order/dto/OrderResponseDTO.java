package com.gemtrade.onlinegembuysellsystem.order.dto;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderResponseDTO {
    private Long orderId;
    private String customerName;
    private String status; // "PROCESSING", "PACKED", etc.
    private Double amount;
    private String date;
    private String gemsList; // e.g., "Ruby x2, Sapphire x1"
}