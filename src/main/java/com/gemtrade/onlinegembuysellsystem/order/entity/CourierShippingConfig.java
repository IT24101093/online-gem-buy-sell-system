package com.gemtrade.onlinegembuysellsystem.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courier_shipping_config")
public class CourierShippingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long configId;

    @Column(name = "region_name", nullable = false, unique = true)
    private String regionName;

    @Column(name = "base_courier_fee", nullable = false)
    private BigDecimal baseCourierFee;

    @Column(name = "weight_unit_markup", nullable = false)
    private BigDecimal weightUnitMarkup;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Optional: auto-set timestamp
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public BigDecimal getBaseCourierFee() {
        return baseCourierFee;
    }

    public void setBaseCourierFee(BigDecimal baseCourierFee) {
        this.baseCourierFee = baseCourierFee;
    }

    public BigDecimal getWeightUnitMarkup() {
        return weightUnitMarkup;
    }

    public void setWeightUnitMarkup(BigDecimal weightUnitMarkup) {
        this.weightUnitMarkup = weightUnitMarkup;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
