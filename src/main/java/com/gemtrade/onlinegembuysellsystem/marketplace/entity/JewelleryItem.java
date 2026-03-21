package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JewelleryItem – admin-managed jewellery listing.
 * Maps to the jewellery_item table added in V3__marketplace_jewellery.sql.
 * Suitable gem categories are stored in a separate child table (jewellery_gem_category).
 */
@Entity
@Table(name = "jewellery_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JewelleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "jewellery_id")
    private Long jewelleryId;

    /** Type of jewellery: Ring, Pendant, Necklace, Earrings, Bracelet */
    @Column(name = "jewellery_type", nullable = false, length = 60)
    private String jewelleryType;

    /** Metal colour: Gold, Silver, Platinum */
    @Column(name = "metal_colour", nullable = false, length = 40)
    private String metalColour;

    /** Relative path to the uploaded image under /static */
    @Column(name = "image_path", length = 500)
    private String imagePath;

    /** Display price shown to users on the Jewellery page */
    @Column(name = "price_lkr", precision = 14, scale = 2)
    private BigDecimal priceLkr;

    /** Featured gemstone name (e.g. "Blue Sapphire") shown on the user page */
    @Column(name = "gemstone_name", length = 120)
    private String gemstoneName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Suitable gem categories for this jewellery piece.
     * CascadeType.ALL so that categories are saved/deleted with the parent.
     */
    @OneToMany(mappedBy = "jewelleryItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JewelleryGemCategory> gemCategories = new ArrayList<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
