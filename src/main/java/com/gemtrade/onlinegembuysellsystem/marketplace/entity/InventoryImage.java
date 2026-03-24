package com.gemtrade.onlinegembuysellsystem.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    private String imageUrl;
    private String imagePath;

    private Boolean isPrimary = false;
    private Integer sortOrder = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
}
