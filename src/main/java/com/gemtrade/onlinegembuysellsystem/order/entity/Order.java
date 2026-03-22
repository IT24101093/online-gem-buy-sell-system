package com.gemtrade.onlinegembuysellsystem.order.entity;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    private BigDecimal totalAmountLkr;
    @Setter
    @Getter
    private String orderStatus;

    @Setter
    @Getter
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "packed_at")
    private LocalDateTime packedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY) // Many orders can have the same inventory item
    @JoinColumn(name = "inventory_item_id", referencedColumnName = "inventory_item_id")
    private InventoryItem inventoryItem;

    // Getters and Setters

}