package com.gemtrade.onlinegembuysellsystem.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // <-- 1. Add this import
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.gemtrade.onlinegembuysellsystem.cart.entity.Cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    // 2. PLACE THE RELATIONSHIP HERE
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnore // <-- 2. Add here to prevent loops
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "delivery_service_id")
    @JsonIgnore // <-- 3. Add here
    private DeliveryService deliveryService;

    private BigDecimal deliveryFee;
    private BigDecimal insuranceFee;
    private BigDecimal totalAmountLkr;
    private String orderStatus;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", referencedColumnName = "inventory_item_id")
    @JsonIgnore // <-- 4. Add here to fix lazy loading JSON crash
    private InventoryItem inventoryItem;
}