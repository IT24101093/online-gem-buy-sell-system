package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "specific_gravity")
@Getter
@Setter
@NoArgsConstructor
public class SpecificGravity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material", nullable = false, unique = true, length = 60)
    private String material;

    @Column(name = "sg_value", nullable = false, precision = 10, scale = 4)
    private BigDecimal sgValue;
}