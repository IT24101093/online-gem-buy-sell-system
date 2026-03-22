package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByInventoryCode(String inventoryCode);

    // This query hides the REMOVED items so they never show up on your website
    @Query("SELECT i FROM InventoryItem i WHERE i.source = :source AND i.status != 'REMOVED'")
    List<InventoryItem> findBySource(@Param("source") com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem.Source source);
    // Optional: If you ever need to fetch ALL non-deleted items regardless of source
    @Query("SELECT i FROM InventoryItem i WHERE i.status != 'REMOVED'")
    List<InventoryItem> findAllActive();
}