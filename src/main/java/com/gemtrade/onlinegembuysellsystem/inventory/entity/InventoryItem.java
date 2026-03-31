package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.gemtrade.onlinegembuysellsystem.seller.entity.Seller;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport;



@Entity
@Table(name = "inventory_item")
@Getter
@Setter
@NoArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_item_id")
    private Long inventoryItemId;

    @Column(name = "inventory_code", nullable = false, unique = true, length = 30)
    private String inventoryCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private Source source;

    @Column(name = "gem_type", nullable = false, length = 80)
    private String gemType;

    @Column(name = "category", length = 80)
    private String category;

    @Column(name = "weight_ct", precision = 10, scale = 3)
    private BigDecimal weightCt;

    @Column(name = "estimated_value_lkr", precision = 14, scale = 2)
    private BigDecimal estimatedValueLkr;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "description_mode")
    private DescriptionMode descriptionMode;

    @Column(name = "description_updated_at")
    private LocalDateTime descriptionUpdatedAt;
    @OneToMany(mappedBy = "inventoryItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryImage> images;

    // Add this field to InventoryItem.java
    @OneToOne(mappedBy = "inventoryItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ValidationReport validationReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.IN_STOCK;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public enum Source {
        CERTIFIED,
        ANALYSIS
    }

    public enum DescriptionMode {
        MANUAL,
        AUTO
    }

    public enum Status {
        IN_STOCK,
        PENDING_MARKET,
        PUBLISHED,
        SOLD,
        REMOVED
    }
}