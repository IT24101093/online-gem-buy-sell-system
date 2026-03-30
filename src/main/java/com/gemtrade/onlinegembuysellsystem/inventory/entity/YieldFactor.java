package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "yield_factor")
@Getter @Setter @NoArgsConstructor
public class YieldFactor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rough_shape", nullable = false, unique = true, length = 40)
    private String roughShape;

    @Column(name = "yield_percent", nullable = false, precision = 6, scale = 2)
    private BigDecimal yieldPercent;
}