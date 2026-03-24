package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * JewelleryGemCategory – one gem category suitable for a JewelleryItem.
 * Maps to the jewellery_gem_category table added in V2__marketplace_jewellery.sql.
 * Examples: "Sapphire", "Ruby", "Emerald"
 */
@Entity
@Table(name = "jewellery_gem_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JewelleryGemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jewellery_id", nullable = false)
    private JewelleryItem jewelleryItem;

    @Column(name = "category_name", nullable = false, length = 80)
    private String categoryName;
}
