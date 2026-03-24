package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_listing_draft")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MarketplaceListingDraft {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long draftId;

    @OneToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    private String gemstoneName;
    private String category;
    private String descriptionSnapshot;

    private BigDecimal suggestedPriceLkr;
    private BigDecimal adminPriceLkr;

    @Enumerated(EnumType.STRING)
    private DraftStatus status = DraftStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum DraftStatus { PENDING, APPROVED, REJECTED }
}
