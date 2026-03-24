package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "gem_carat_variant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GemCaratVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    // Many variants belong to one marketplace listing
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private MarketplaceListing listing;

    @Column(name = "carat_value", nullable = false, precision = 10, scale = 3)
    private BigDecimal caratValue;

    @Column(name = "price_lkr", nullable = false, precision = 14, scale = 2)
    private BigDecimal priceLkr;
}
