package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.*;
import com.gemtrade.onlinegembuysellsystem.marketplace.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/admin/marketplace")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminMarketplaceController {

    private final MarketplaceService service;


    @GetMapping("/pending")
    public List<MarketplaceDraftDTO> getPending() {
        return service.getPendingDrafts();
    }

    @PostMapping("/publish/{draftId}")
    public ResponseEntity<String> publish(
            @PathVariable Long draftId,
            @RequestParam BigDecimal price) {
        service.publishGem(draftId, price);
        return ResponseEntity.ok("Published successfully");
    }

    // ── Active Listings ────────────────────────────────────────────────────────

    @GetMapping("/listings")
    public List<GemListingDTO> getActiveListings() {
        return service.getActiveListingsForAdmin();
    }

    @PatchMapping("/listings/{listingId}/price")
    public ResponseEntity<String> updatePrice(
            @PathVariable Long listingId,
            @RequestParam BigDecimal price) {
        service.updateListingPrice(listingId, price);
        return ResponseEntity.ok("Price updated");
    }

    @DeleteMapping("/listings/{listingId}")
    public ResponseEntity<String> deleteListing(@PathVariable Long listingId) {
        service.deleteListing(listingId);
        return ResponseEntity.ok("Deleted successfully");
    }

    // ── Carat Variants ─────────────────────────────────────────────

    @GetMapping("/listings/{listingId}/variants")
    public List<GemVariantDTO> getVariants(@PathVariable Long listingId) {
        return service.getVariantDTOs(listingId);
    }


    @PostMapping("/listings/{listingId}/variants")
    public ResponseEntity<GemVariantDTO> addVariant(
            @PathVariable Long listingId,
            @RequestBody GemVariantDTO dto) {
        GemVariantDTO saved = service.addVariant(listingId, dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<GemVariantDTO> updateVariant(
            @PathVariable Long variantId,
            @RequestBody GemVariantDTO dto) {
        GemVariantDTO updated = service.updateVariant(variantId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<String> deleteVariant(@PathVariable Long variantId) {
        service.deleteVariant(variantId);
        return ResponseEntity.ok("Variant deleted");
    }
}
