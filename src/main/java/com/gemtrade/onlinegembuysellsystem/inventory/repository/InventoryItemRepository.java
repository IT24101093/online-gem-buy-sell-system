package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem.Source;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    // Find inventory items by source type (CERTIFIED / ANALYSIS)
    Optional<InventoryItem> findByInventoryCode(String inventoryCode);
    List<InventoryItem> findBySource(Source source);
}