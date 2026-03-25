package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.InventoryImageResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/inventory/items")
@CrossOrigin(origins = "*")
public class InventoryImageController {

    private final InventoryImageService inventoryImageService;

    public InventoryImageController(InventoryImageService inventoryImageService) {
        this.inventoryImageService = inventoryImageService;
    }

    @PostMapping(value = "/{itemId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InventoryImageResponseDto> uploadItemImage(
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary
    ) {
        // This endpoint receives an image file (multipart/form-data) for a specific inventory item.
        // It passes the file + itemId to the service and returns the saved image URL/path as JSON.
        InventoryImageResponseDto saved = inventoryImageService.uploadItemImage(itemId, file, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}