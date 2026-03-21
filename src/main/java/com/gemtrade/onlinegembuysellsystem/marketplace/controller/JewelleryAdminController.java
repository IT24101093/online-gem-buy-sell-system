package com.gemtrade.onlinegembuysellsystem.marketplace.controller;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.JewelleryDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.service.JewelleryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * JewelleryAdminController – Admin CRUD for Jewellery Management.
 * Placed inside the marketplace package as specified.
 *
 * Base path: /api/admin/jewellery
 */
@RestController
@RequestMapping("/api/admin/jewellery")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JewelleryAdminController {

    private final JewelleryService jewelleryService;

    /**
     * GET /api/admin/jewellery
     * Returns all jewellery items for the admin management table.
     * Includes the list of suitable gem categories per item.
     */
    @GetMapping
    public List<JewelleryDTO> getAllJewellery() {
        return jewelleryService.getAllJewellery();
    }

    /**
     * GET /api/admin/jewellery/{id}
     * Returns a single jewellery item by ID for the admin edit form.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JewelleryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jewelleryService.getById(id));
    }

    /**
     * POST /api/admin/jewellery
     * Creates a new jewellery item.
     * Request body example:
     * {
     *   "jewelleryType": "Ring",
     *   "metalColour":   "Gold",
     *   "imagePath":     "gem-photos/image9.jpg",
     *   "priceLkr":      145000,
     *   "gemstoneName":  "Blue Sapphire",
     *   "description":   "Elegant gold ring...",
     *   "gemCategories": ["Sapphire", "Ruby"]
     * }
     */
    @PostMapping
    public ResponseEntity<JewelleryDTO> addJewellery(@Valid @RequestBody JewelleryDTO dto) {
        JewelleryDTO created = jewelleryService.addJewellery(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/admin/jewellery/{id}
     * Replaces all fields of an existing jewellery item.
     * Gem categories are replaced entirely.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJewellery(
            @PathVariable Long id,
            @RequestBody JewelleryDTO dto) {
        JewelleryDTO updated = jewelleryService.updateJewellery(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/admin/jewellery/{id}
     * Deletes a jewellery item and all its gem categories.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJewellery(@PathVariable Long id) {
        jewelleryService.deleteJewellery(id);
        return ResponseEntity.ok("Jewellery item deleted");
    }
}
