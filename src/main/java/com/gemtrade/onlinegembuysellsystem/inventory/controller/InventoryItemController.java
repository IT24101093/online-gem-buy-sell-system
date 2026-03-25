package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/items")
@CrossOrigin(origins = "*")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @PutMapping("/{itemId}/status")
    public ResponseEntity<Void> updateItemStatus(
            @PathVariable Long itemId,
            @RequestParam String status) {

        inventoryItemService.updateItemStatus(itemId, status);
        return ResponseEntity.ok().build();
    }

    // Inside InventoryItemController.java

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        inventoryItemService.softDeleteItem(itemId);
        return ResponseEntity.ok().build();
    }
}