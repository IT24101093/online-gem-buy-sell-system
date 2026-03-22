package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.DraftRequestDto;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.MarketplaceListingDraft;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.MarketplaceListingDraftRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/drafts")
@CrossOrigin(origins = "*") // Allows your JS to talk to it
public class MarketplaceController {

    private final MarketplaceListingDraftRepository draftRepository;

    public MarketplaceController(MarketplaceListingDraftRepository draftRepository) {
        this.draftRepository = draftRepository;
    }

    @PostMapping
    public ResponseEntity<MarketplaceListingDraft> createDraft(@RequestBody DraftRequestDto requestDto) {

        // 1. Convert the incoming DTO into a database Entity
        MarketplaceListingDraft draft = new MarketplaceListingDraft();
        draft.setInventoryItemId(requestDto.getInventoryItemId());
        draft.setGemstoneName(requestDto.getGemstoneName());
        draft.setCategory(requestDto.getCategory());
        draft.setDescriptionSnapshot(requestDto.getDescriptionSnapshot());
        draft.setSuggestedPriceLkr(requestDto.getSuggestedPriceLkr());
        draft.setStatus("PENDING");

        // 2. Save to the marketplace_listing_draft table
        MarketplaceListingDraft savedDraft = draftRepository.save(draft);

        // 3. Send a success response back to your JavaScript
        return ResponseEntity.ok(savedDraft);
    }

    @GetMapping
    public ResponseEntity<Iterable<MarketplaceListingDraft>> getAllDrafts() {
        // Fetches all drafts from the database and sends them to the Admin UI
        return ResponseEntity.ok(draftRepository.findAll());
    }
}