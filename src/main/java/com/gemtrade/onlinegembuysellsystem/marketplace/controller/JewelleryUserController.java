package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.JewelleryDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.service.JewelleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * JewelleryUserController – public-facing Jewellery Listing endpoints.
 * No authentication required – anyone can browse jewellery items.
 * Placed inside the marketplace controller package as specified.
 *
 * Base path: /api/jewellery
 */
@RestController
@RequestMapping("/api/jewellery")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JewelleryUserController {

    private final JewelleryService jewelleryService;

    /**
     * GET /api/jewellery
     * Returns all jewellery items for the user-facing Jewellery Listing page.
     * Each item includes: type, metal, image, price, gemstone name, categories.
     */
    @GetMapping
    public List<JewelleryDTO> getAllJewellery() {
        return jewelleryService.getAllJewellery();
    }

    /**
     * GET /api/jewellery/{id}
     * Returns a single jewellery item for the detail modal on the user page.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JewelleryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jewelleryService.getById(id));
    }
}
