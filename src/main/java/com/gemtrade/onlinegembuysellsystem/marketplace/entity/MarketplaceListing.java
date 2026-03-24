package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marketplace_listing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long listingId;

    @OneToOne
    @JoinColumn(name = "draft_id", nullable = false)
    private MarketplaceListingDraft draft;

    @OneToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    private String gemstoneName;
    private String category;
    private String description;

    private BigDecimal priceLkr;
    private String mainImageUrl;

    @Enumerated(EnumType.STRING)
    private ColorTone colorTone = ColorTone.OTHER;

    @Column(name = "origin", length = 80)
    private String origin;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<GemCaratVariant> variants = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ListingStatus status = ListingStatus.ACTIVE;

    private LocalDateTime publishedAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ListingStatus { ACTIVE, PAUSED, SOLD }
}