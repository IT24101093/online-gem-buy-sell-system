package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByInventoryCode(String inventoryCode);
}