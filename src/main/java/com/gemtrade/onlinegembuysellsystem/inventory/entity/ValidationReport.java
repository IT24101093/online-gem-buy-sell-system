package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "validation_report")
@Getter
@Setter
@NoArgsConstructor
public class ValidationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false, unique = true)
    private InventoryItem inventoryItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_tone", nullable = false)
    private ColorTone colorTone = ColorTone.OTHER;

    @Column(name = "detected_gem_type", length = 80)
    private String detectedGemType;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "specific_gravity", precision = 10, scale = 4)
    private BigDecimal specificGravity;

    @Column(name = "volume_mm3", precision = 18, scale = 4)
    private BigDecimal volumeMm3;

    @Column(name = "estimated_carat", precision = 10, scale = 3)
    private BigDecimal estimatedCarat;

    @Column(name = "yield_percent", precision = 6, scale = 2)
    private BigDecimal yieldPercent;

    @Column(name = "generated_description", columnDefinition = "TEXT")
    private String generatedDescription;

    @Column(name = "raw_json", columnDefinition = "json")
    private String rawJson;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ColorTone {
        BLUE, YELLOW, PINK, GREEN, OTHER
    }
}