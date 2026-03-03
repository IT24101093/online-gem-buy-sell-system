package com.gemtrade.onlinegembuysellsystem.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gem_certificate")
@Getter
@Setter
@NoArgsConstructor
public class GemCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificate_id")
    private Long certificateId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false, unique = true)
    private InventoryItem inventoryItem;

    @Column(name = "certificate_no", nullable = false, unique = true, length = 80)
    private String certificateNo;

    @Column(name = "lab_name", length = 120)
    private String labName;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "report_url", length = 500)
    private String reportUrl;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}