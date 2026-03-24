package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemListingDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemVariantDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.SuggestionRequestDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}