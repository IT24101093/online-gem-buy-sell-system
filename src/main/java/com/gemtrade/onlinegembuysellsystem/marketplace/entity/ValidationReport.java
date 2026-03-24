package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "validation_report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ValidationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @OneToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Enumerated(EnumType.STRING)
    private ColorTone colorTone = ColorTone.OTHER;   // ← now uses shared enum

    private BigDecimal specificGravity;
    private BigDecimal volumeMm3;
    private BigDecimal estimatedCarat;
    private BigDecimal yieldPercent;

    private String generatedDescription;
    private String rawJson;

    private LocalDateTime createdAt = LocalDateTime.now();
}
