package com.gemtrade.onlinegembuysellsystem.marketplace.service;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.JewelleryDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.JewelleryGemCategory;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.JewelleryItem;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.JewelleryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * JewelleryService – handles CRUD operations for Jewellery Management.
 * Jewellery items are created and managed by the admin and displayed to users.
 * All methods are scoped strictly to the jewellery_item and jewellery_gem_category tables.
 */
@Service
@RequiredArgsConstructor
public class JewelleryService {

    private final JewelleryItemRepository jewelleryRepo;

    // ── Query ──────────────────────────────────────────────────────────────────

    /** Returns all jewellery items with categories eagerly loaded (no N+1). */
    public List<JewelleryDTO> getAllJewellery() {
        return jewelleryRepo.findAllWithCategories()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Returns a single jewellery item by ID. */
    public JewelleryDTO getById(Long id) {
        JewelleryItem item = jewelleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jewellery item not found: " + id));
        return toDTO(item);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    /**
     * Creates a new jewellery item with its gem categories.
     * Categories list in the DTO becomes JewelleryGemCategory child rows.
     */
    @Transactional
    public JewelleryDTO addJewellery(JewelleryDTO dto) {
        JewelleryItem item = JewelleryItem.builder()
                .jewelleryType(dto.getJewelleryType())
                .metalColour(dto.getMetalColour())
                .imagePath(dto.getImagePath())
                .priceLkr(dto.getPriceLkr())
                .gemstoneName(dto.getGemstoneName())
                .description(dto.getDescription())
                .build();

        // Defensive initialisation: @Builder.Default on gemCategories is not always
        // honoured by Lombok when building without explicit list assignment.
        // Ensure the list is non-null before adding child categories.
        if (item.getGemCategories() == null) {
            item.setGemCategories(new java.util.ArrayList<>());
        }

        // Attach gem categories
        if (dto.getGemCategories() != null) {
            dto.getGemCategories().forEach(cat -> {
                JewelleryGemCategory category = JewelleryGemCategory.builder()
                        .jewelleryItem(item)
                        .categoryName(cat)
                        .build();
                item.getGemCategories().add(category);
            });
        }

        return toDTO(jewelleryRepo.save(item));
    }


    // ── Update ─────────────────────────────────────────────────────────────────

    /**
     * Replaces all fields of an existing jewellery item.
     * Gem categories are replaced entirely (orphanRemoval handles deletion of old rows).
     */
    @Transactional
    public JewelleryDTO updateJewellery(Long id, JewelleryDTO dto) {
        JewelleryItem item = jewelleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jewellery item not found: " + id));

        item.setJewelleryType(dto.getJewelleryType());
        item.setMetalColour(dto.getMetalColour());
        item.setImagePath(dto.getImagePath());
        item.setPriceLkr(dto.getPriceLkr());
        item.setGemstoneName(dto.getGemstoneName());
        item.setDescription(dto.getDescription());

        // Replace categories: clear old ones (orphanRemoval deletes them) then add new
        item.getGemCategories().clear();
        if (dto.getGemCategories() != null) {
            dto.getGemCategories().forEach(cat -> {
                JewelleryGemCategory category = JewelleryGemCategory.builder()
                        .jewelleryItem(item)
                        .categoryName(cat)
                        .build();
                item.getGemCategories().add(category);
            });
        }

        return toDTO(jewelleryRepo.save(item));
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    /** Deletes a jewellery item and all its associated gem categories (cascade). */
    @Transactional
    public void deleteJewellery(Long id) {
        if (!jewelleryRepo.existsById(id)) {
            throw new RuntimeException("Jewellery item not found: " + id);
        }
        jewelleryRepo.deleteById(id);
    }

    // ── Mapper ─────────────────────────────────────────────────────────────────

    /** Converts a JewelleryItem entity to a JewelleryDTO response object. */
    private JewelleryDTO toDTO(JewelleryItem item) {
        List<String> categories = item.getGemCategories().stream()
                .map(JewelleryGemCategory::getCategoryName)
                .collect(Collectors.toList());

        return JewelleryDTO.builder()
                .jewelleryId(item.getJewelleryId())
                .jewelleryType(item.getJewelleryType())
                .metalColour(item.getMetalColour())
                .imagePath(item.getImagePath())
                .priceLkr(item.getPriceLkr())
                .gemstoneName(item.getGemstoneName())
                .description(item.getDescription())
                .gemCategories(categories)
                .build();
    }
}
