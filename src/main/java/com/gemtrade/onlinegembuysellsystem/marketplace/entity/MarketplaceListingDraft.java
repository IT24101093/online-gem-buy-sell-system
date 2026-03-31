package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryImage;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_listing_draft")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceListingDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long draftId;

    // This links directly to YOUR inventory entity
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    private String gemstoneName;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String descriptionSnapshot;

    private BigDecimal suggestedPriceLkr;
    private BigDecimal adminPriceLkr;



    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method for the Admin Page to get the image URL.
     * It reaches into the linked InventoryItem and finds the primary image.
     */
    public String getPrimaryImageUrl() {
        if (inventoryItem == null || inventoryItem.getImages() == null || inventoryItem.getImages().isEmpty()) {
            return "/uploads/default-gem.png"; // Fallback image
        }

        return inventoryItem.getImages().stream()
                .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                .findFirst()
                .map(img -> "/uploads/" + img.getImagePath())
                .orElse("/uploads/" + inventoryItem.getImages().get(0).getImagePath());
    }
}