package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_listing_draft")
@Getter
@Setter
public class MarketplaceListingDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "draft_id")
    private Long draftId;

    @Column(name = "inventory_item_id", nullable = false, unique = true)
    private Long inventoryItemId;

    @Column(name = "gemstone_name", nullable = false, length = 120)
    private String gemstoneName;

    @Column(name = "category", nullable = false, length = 80)
    private String category;

    @Column(name = "description_snapshot", columnDefinition = "TEXT")
    private String descriptionSnapshot;

    @Column(name = "suggested_price_lkr", precision = 14, scale = 2)
    private BigDecimal suggestedPriceLkr;

    @Column(name = "admin_price_lkr", precision = 14, scale = 2)
    private BigDecimal adminPriceLkr;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // Matches the ENUM default in your database

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}