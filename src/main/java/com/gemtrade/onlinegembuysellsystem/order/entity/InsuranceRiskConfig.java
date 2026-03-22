package com.gemtrade.onlinegembuysellsystem.order.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_risk_config")
public class InsuranceRiskConfig {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_id")
    private Long riskId;

    @Getter
    @Setter
    @Column(name = "gem_type", nullable = false, unique = true)
    private String gemType;

    @Setter
    @Getter
    @Column(name = "risk_multiplier", nullable = false)
    private BigDecimal riskMultiplier;

    @Column(name = "is_high_value")
    private Boolean isHighValue;

    @Setter
    @Getter
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getHighValue() {
        return isHighValue;
    }

    public void setHighValue(Boolean highValue) {
        isHighValue = highValue;
    }

}
