package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.order.repository.DeliveryServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryItemService {
    @Autowired
    private InventoryItemRepository repository;

    public Optional<InventoryItem> getInventoryItemByInventoryId(Long inventoryId) {

        return repository.findByInventoryItemId(inventoryId);
    }
}
