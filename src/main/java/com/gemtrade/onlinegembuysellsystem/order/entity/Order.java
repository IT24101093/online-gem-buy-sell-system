package com.gemtrade.onlinegembuysellsystem.order.entity;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;  //Automatically manage timestamps

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter // Moved to class level: covers ALL fields
@Setter // Moved to class level: covers ALL fields
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "delivery_service_id")
    private DeliveryService deliveryService;

    private BigDecimal deliveryFee;
    private BigDecimal insuranceFee;
    private BigDecimal totalAmountLkr;
    private String orderStatus;
    //Automatically set when order is created
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
    private InventoryItem inventoryItem;
}