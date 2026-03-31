package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// --- RESTORED THE CORRECT IMPORT ---
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport.ColorTone;

@Entity
@Table(name = "marketplace_listing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long listingId;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "draft_id", nullable = false)
    private MarketplaceListingDraft draft;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    private String gemstoneName;
    private String category;
    private String description;
    private BigDecimal priceLkr;
    private String mainImageUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ColorTone colorTone = ColorTone.OTHER; // Now uses the correct Inventory ColorTone again!

    @Builder.Default
    @Column(name = "origin", length = 80)
    private String origin = "Sri Lanka";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ListingStatus status = ListingStatus.ACTIVE;

    @Builder.Default
    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ListingStatus { ACTIVE, SOLD, HIDDEN }

    // --- Automatically set dates before saving to the database ---

    @PrePersist
    protected void onCreate() {
        if (this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}