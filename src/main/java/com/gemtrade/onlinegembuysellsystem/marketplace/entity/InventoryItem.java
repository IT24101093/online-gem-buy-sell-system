package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryItemId;

    private String inventoryCode;

    @Enumerated(EnumType.STRING)
    private Source source;

    private String gemType;
    private String category;

    private BigDecimal weightCt;
    private BigDecimal estimatedValueLkr;

    private String description;

    @Enumerated(EnumType.STRING)
    private DescriptionMode descriptionMode;

    private LocalDateTime descriptionUpdatedAt;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @Enumerated(EnumType.STRING)
    private InventoryStatus status = InventoryStatus.IN_STOCK;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "inventoryItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "inventoryItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private ValidationReport validationReport;

    public enum Source { CERTIFIED, ANALYSIS }
    public enum DescriptionMode { MANUAL, AUTO }
    public enum InventoryStatus { IN_STOCK, PENDING_MARKET, PUBLISHED, SOLD, REMOVED }
}