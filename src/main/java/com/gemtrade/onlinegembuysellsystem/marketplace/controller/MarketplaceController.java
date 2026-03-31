package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemListingDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemVariantDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.SuggestionRequestDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.DraftRequestDto;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.MarketplaceDraftDTO;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService service;

    @GetMapping("/listings")
    public List<GemListingDTO> getListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String caratRange,
            @RequestParam(required = false) String origin) {

        // If no search parameters are provided, return the full admin view
        if (search == null && priceRange == null && color == null &&
                caratRange == null && origin == null) {
            return service.getActiveListingsForAdmin();
        }

        return service.getAllActiveGems(search, priceRange, color, caratRange, origin);
    }
    @GetMapping("/listings/{id}")
    public GemListingDTO getDetail(@PathVariable Long id) {
        return service.getGemDetail(id);
    }

    @GetMapping("/listings/{id}/variants")
    public List<GemVariantDTO> getVariants(@PathVariable Long id) {
        return service.getVariantDTOs(id);
    }

    @PostMapping("/gems/suggest")
    public List<GemListingDTO> suggestGems(@RequestBody SuggestionRequestDTO request) {
        return service.suggestGems(request);
    }

    @PostMapping("/drafts")
    public ResponseEntity<String> createDraft(@RequestBody DraftRequestDto dto) {
        service.createDraft(dto);
        return ResponseEntity.ok("Draft created successfully");
    }

    /**
     * Handles: GET /api/marketplace/drafts/pending
     * Used by marketplace_admin.js to load the pending table
     */
    @GetMapping("/drafts/pending")
    public List<MarketplaceDraftDTO> getPendingDrafts() {
        return service.getPendingDrafts();
    }

    /**
     * Handles: PUT /api/marketplace/drafts/{id}/approve
     * Used by marketplace_admin.js to publish the gem
     */
    @PutMapping("/drafts/{id}/approve")
    public ResponseEntity<Void> approveDraft(
            @PathVariable Long id,
            @RequestParam BigDecimal adminPrice) {
        service.publishGem(id, adminPrice);
        return ResponseEntity.ok().build();
    }

    /**
     * Handles: PUT /api/marketplace/drafts/{id}/sold
     */
    @PutMapping("/drafts/{id}/sold")
    public ResponseEntity<Void> markAsSold(@PathVariable Long id) {
        service.markAsSold(id);
        return ResponseEntity.ok().build();
    }
}
