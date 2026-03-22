package com.gemtrade.onlinegembuysellsystem.order.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_service")
public class DeliveryService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryServiceId;

    private String name;
    private String type; // international/local
    private String status;

    // Getters and Setters
}
