package com.gemtrade.onlinegembuysellsystem.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "delivery_service_id")
    private DeliveryService deliveryService;

    @Setter
    @Getter
    private BigDecimal deliveryFee;
    @Setter
    @Getter
    private BigDecimal insuranceFee;
    @Setter
    @Getter
    private BigDecimal total;
    @Setter
    @Getter
    private String orderStatus;

    @Setter
    @Getter
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters

}