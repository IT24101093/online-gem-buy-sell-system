package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.marketplace.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
}
