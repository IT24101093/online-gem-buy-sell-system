package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "multiplier")
@Getter @Setter @NoArgsConstructor
public class Multiplier {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private Category category;

    @Column(name = "grade_code", nullable = false, length = 40)
    private String gradeCode;

    @Column(name = "multiplier_value", nullable = false, precision = 10, scale = 4)
    private BigDecimal multiplierValue;

    public enum Category { COLOR, CLARITY, CUT, OTHER }
}