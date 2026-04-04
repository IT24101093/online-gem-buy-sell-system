package com.gemtrade.onlinegembuysellsystem.cart.entity;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_item")
@Getter
@Setter
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // ONLY ONE instance of listingId here.
    // It must be nullable=true to support Jewelry-only items.
    @Column(name = "listing_id", nullable = true)
    private Long listingId;

    // Added jewellery_id to link to your V3 table
    @Column(name = "jewellery_id")
    private Long jewelleryId;

    @Column(name = "gem_name", nullable = false)
    private String gemName;

    @Column(name = "unit_price_lkr", nullable = false)
    private BigDecimal unitPriceLkr;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


}