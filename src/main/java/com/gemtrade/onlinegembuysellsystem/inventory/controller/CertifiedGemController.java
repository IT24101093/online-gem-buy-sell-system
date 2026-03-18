package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.service.CertifiedGemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.InventoryItemResponseDto;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/certified")
@RequiredArgsConstructor
@CrossOrigin
public class CertifiedGemController {

    private final CertifiedGemService certifiedGemService;

    @PostMapping
    public ResponseEntity<CertifiedGemResponseDto> addCertifiedGem(
            @RequestBody CertifiedGemRequestDto requestDto
    ) {
        CertifiedGemResponseDto response = certifiedGemService.addCertifiedGem(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Add this endpoint to CertifiedGemController.java
    @PutMapping("/{itemId}/report-url")
    public ResponseEntity<Void> updateReportUrl(
            @PathVariable Long itemId,
            @RequestParam String reportUrl
    ) {
        certifiedGemService.updateReportUrl(itemId, reportUrl);
        return ResponseEntity.ok().build();
    }
    // Inventory read/list endpoint: returns all inventory items, or filters by source using ?source=CERTIFIED/ANALYSIS
    @GetMapping("/all")
    public ResponseEntity<List<InventoryItemResponseDto>> getAllInventoryItems(
            @RequestParam(required = false) String source
    ) {
        List<InventoryItemResponseDto> items = certifiedGemService.getInventoryItemsBySource(source);
        return ResponseEntity.ok(items);
    }
}