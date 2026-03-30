package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "shape_factor")
@Getter
@Setter
@NoArgsConstructor
public class ShapeFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shape", nullable = false, unique = true, length = 40)
    private String shape;

    @Column(name = "factor", nullable = false, precision = 10, scale = 6)
    private BigDecimal factor;
}