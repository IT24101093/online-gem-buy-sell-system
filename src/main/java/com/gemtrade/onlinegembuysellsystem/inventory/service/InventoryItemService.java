package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
// Explicitly import the inner Status enum
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem.Status;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;


    //for order util to find the inventory id
    public Optional<InventoryItem> getInventoryItemByInventoryId(Long itemId) {
        return inventoryItemRepository.findById(itemId);
    }

    public InventoryItemService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional
    public void updateItemStatus(Long itemId, String newStatus) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Gem not found with ID: " + itemId));

        //  safety check for soft-deleted items cgeck if gem is removed before update
        if (item.getStatus() == Status.REMOVED) {
            System.out.println("Skipping update: Gem " + itemId + " is already REMOVED.");
            return;
        }

        try {
            // Force uppercase to match the ENUM (SOLD, IN_STOCK, etc.)
            String upperStatus = newStatus.trim().toUpperCase();
            item.setStatus(Status.valueOf(upperStatus));
            inventoryItemRepository.save(item);
        } catch (IllegalArgumentException e) {
            // This prevents the whole purchase from failing just because of a status typo
            System.err.println("Invalid status value provided: " + newStatus);
        }
    }
    // Inside InventoryItemService.java

    @Transactional
    public void softDeleteItem(Long itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));

        // Set status to REMOVED instead of deleting the row
        item.setStatus(InventoryItem.Status.REMOVED);
        inventoryItemRepository.save(item);
    }
}