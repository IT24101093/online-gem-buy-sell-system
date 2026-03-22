package com.gemtrade.onlinegembuysellsystem.order.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_service")
public class DeliveryService {
    @Id
    @Getter @Setter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryServiceId;

    @Getter @Setter
    private String name;

    @Getter @Setter
    private String type; // international/local

    @Getter @Setter
    private String status;

    // Getters and Setters
}
