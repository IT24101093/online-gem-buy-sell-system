package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

// REMOVE the old marketplace import if it exists
// ADD your inventory entity import
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceInventoryRepository extends JpaRepository<InventoryItem, Long> {
    // This now points to your InventoryItem entity
}
