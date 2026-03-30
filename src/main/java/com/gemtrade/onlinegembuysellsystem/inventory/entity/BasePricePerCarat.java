package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "base_price_per_carat")
@Getter @Setter @NoArgsConstructor
public class BasePricePerCarat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gem_type", nullable = false, length = 80)
    private String gemType;

    @Column(name = "base_price_lkr", nullable = false, precision = 18, scale = 2)
    private BigDecimal basePriceLkr;

    @Column(name = "min_carat", nullable = false, precision = 10, scale = 3)
    private BigDecimal minCarat;

    @Column(name = "max_carat", nullable = false, precision = 10, scale = 3)
    private BigDecimal maxCarat;
}