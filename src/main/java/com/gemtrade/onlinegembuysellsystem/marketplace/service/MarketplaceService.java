package com.gemtrade.onlinegembuysellsystem.marketplace.service;



import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryImage;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport.ColorTone;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.*;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.*;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class MarketplaceService {

    private final MarketplaceListingRepository listingRepo;
    private final MarketplaceListingDraftRepository draftRepo;
    private final MarketplaceInventoryRepository inventoryRepo;
    private final GemCaratVariantRepository variantRepo;   // NEW – Feature 3
    private final InventoryItemRepository inventoryItemRepo;

    /**
     * @param search      partial name or category match
     * @param priceRange  "under_1m" | "1m_2m" | "2m_3m" | "above_3m" | null
     * @param color       "blue" | "yellow" | "pink" | "green" | null
     * @param caratRange  "lt1" | "1to2" | "2to5" | "gt5" | null
     * @param origin      country name e.g. "Sri Lanka" | null
     */
    public List<GemListingDTO> getAllActiveGems(
            String search, String priceRange, String color,
            String caratRange, String origin) {

        // ── Price range ────────────────────────────────────────────────────────
        BigDecimal minPrice = null, maxPrice = null;
        if (priceRange != null) {
            switch (priceRange) {
                case "under_1m" -> maxPrice = new BigDecimal("1000000");
                case "1m_2m"    -> { minPrice = new BigDecimal("1000000"); maxPrice = new BigDecimal("2000000"); }
                case "2m_3m"    -> { minPrice = new BigDecimal("2000000"); maxPrice = new BigDecimal("3000000"); }
                case "above_3m" -> minPrice = new BigDecimal("3000000");
            }
        }

        // ── Colour ─────────────────────────────────────────────────────────────
        ColorTone colorTone = null;
        if (color != null && !"all".equalsIgnoreCase(color)) {
            try { colorTone = ColorTone.valueOf(color.toUpperCase()); } catch (Exception ignored) {}
        }

        // ── Carat range  ────────────────────────────────────────────
        BigDecimal minCarat = null, maxCarat = null;
        if (caratRange != null) {
            switch (caratRange) {
                case "lt1"  -> maxCarat = new BigDecimal("1.0");
                case "1to2" -> { minCarat = new BigDecimal("1.0");  maxCarat = new BigDecimal("2.0"); }
                case "2to5" -> { minCarat = new BigDecimal("2.0");  maxCarat = new BigDecimal("5.0"); }
                case "gt5"  -> minCarat = new BigDecimal("5.0");
            }
        }

        // ── Origin ─────────────────────────────────────────────────
        String originParam = (origin != null && !"all".equalsIgnoreCase(origin)) ? origin : null;

        List<MarketplaceListing> list = listingRepo.searchAndFilterFull(
                (search != null && search.isBlank()) ? null : search,
                minPrice, maxPrice, colorTone, minCarat, maxCarat, originParam);

        return list.stream().map(this::toGemDTO).collect(Collectors.toList());
    }

    public List<GemListingDTO> getAllActiveGems(String search, String priceRange, String color) {
        return getAllActiveGems(search, priceRange, color, null, null);
    }

    public GemListingDTO getGemDetail(Long listingId) {
        MarketplaceListing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));
        GemListingDTO dto = toGemDTO(listing);
        // Populate variants for the detail view
        dto.setVariants(getVariantDTOs(listingId));
        return dto;
    }

    public List<GemVariantDTO> getVariantDTOs(Long listingId) {
        return variantRepo.findByListingListingIdOrderByCaratValueAsc(listingId)
                .stream()
                .map(v -> GemVariantDTO.builder()
                        .variantId(v.getVariantId())
                        .caratValue(v.getCaratValue())
                        .priceLkr(v.getPriceLkr())
                        .build())
                .collect(Collectors.toList());
    }

    /** Adds a new carat variant to a listing (admin action). */
    @Transactional
    public GemVariantDTO addVariant(Long listingId, GemVariantDTO dto) {
        MarketplaceListing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));

        GemCaratVariant variant = GemCaratVariant.builder()
                .listing(listing)
                .caratValue(dto.getCaratValue())
                .priceLkr(dto.getPriceLkr())
                .build();

        GemCaratVariant saved = variantRepo.save(variant);
        return GemVariantDTO.builder()
                .variantId(saved.getVariantId())
                .caratValue(saved.getCaratValue())
                .priceLkr(saved.getPriceLkr())
                .build();
    }

    /** Updates the price (and optionally carat) of an existing variant (admin action). */
    @Transactional
    public GemVariantDTO updateVariant(Long variantId, GemVariantDTO dto) {
        GemCaratVariant variant = variantRepo.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found: " + variantId));
        variant.setCaratValue(dto.getCaratValue());
        variant.setPriceLkr(dto.getPriceLkr());
        variantRepo.save(variant);
        return GemVariantDTO.builder()
                .variantId(variant.getVariantId())
                .caratValue(variant.getCaratValue())
                .priceLkr(variant.getPriceLkr())
                .build();
    }

    /** Deletes a carat variant by its ID (admin action). */
    @Transactional
    public void deleteVariant(Long variantId) {
        if (!variantRepo.existsById(variantId)) {
            throw new RuntimeException("Variant not found: " + variantId);
        }
        variantRepo.deleteById(variantId);
    }

    /**
     * @param request  SuggestionRequestDTO from POST body
     * @return list of matching GemListingDTOs
     */
    public List<GemListingDTO> suggestGems(SuggestionRequestDTO request) {
        // ── Map colour ────────────────────────────────────────────────────────
        ColorTone colorTone = null;
        String preferredColor = request.getPreferredColor();
        if (preferredColor != null && !"all".equalsIgnoreCase(preferredColor)) {
            try { colorTone = ColorTone.valueOf(preferredColor.toUpperCase()); } catch (Exception ignored) {}
        }

        // ── Map budget ────────────────────────────────────────────────────────
        BigDecimal minPrice = null, maxPrice = null;
        String budget = request.getBudgetRange();
        if (budget != null) {
            switch (budget) {
                case "under_1m" -> maxPrice = new BigDecimal("1000000");
                case "1m_2m"    -> { minPrice = new BigDecimal("1000000"); maxPrice = new BigDecimal("2000000"); }
                case "2m_3m"    -> { minPrice = new BigDecimal("2000000"); maxPrice = new BigDecimal("3000000"); }
                case "above_3m" -> minPrice = new BigDecimal("3000000");
            }
        }

        // ── Database query ────────────────────────────────────────────────────
        List<MarketplaceListing> candidates = listingRepo.findForSuggestion(colorTone, minPrice, maxPrice);

        String jwlType = request.getJewelleryType();
        if (jwlType != null && !"all".equalsIgnoreCase(jwlType)) {
            List<String> preferredCategories = gemCategoriesForJewelleryType(jwlType);
            if (!preferredCategories.isEmpty()) {
                candidates = candidates.stream()
                        .filter(l -> preferredCategories.stream()
                                .anyMatch(cat -> l.getCategory() != null &&
                                        l.getCategory().toLowerCase().contains(cat.toLowerCase())))
                        .collect(Collectors.toList());
            }
        }

        return candidates.stream().map(this::toGemDTO).collect(Collectors.toList());
    }

    private List<String> gemCategoriesForJewelleryType(String jewelleryType) {
        return switch (jewelleryType.toLowerCase()) {
            case "ring"     -> List.of("Sapphire", "Ruby", "Emerald", "Diamond", "Alexandrite");
            case "pendant"  -> List.of("Sapphire", "Aquamarine", "Emerald", "Tourmaline");
            case "necklace" -> List.of("Sapphire", "Diamond", "Garnet", "Spinel");
            case "earrings" -> List.of("Sapphire", "Amethyst", "Tourmaline", "Pearl");
            case "bracelet" -> List.of("Ruby", "Spinel", "Sapphire", "Garnet");
            default         -> List.of();
        };
    }

    public List<MarketplaceDraftDTO> getPendingDrafts() {
        return draftRepo.findByStatus("PENDING").stream().map(draft -> {

            // Extract the image dynamically from the linked inventory item
            String imageUrl = draft.getPrimaryImageUrl();

            return MarketplaceDraftDTO.builder()
                    .draftId(draft.getDraftId())
                    .inventoryItemId(draft.getInventoryItem() != null ? draft.getInventoryItem().getInventoryItemId() : null)
                    .gemstoneName(draft.getGemstoneName())
                    .category(draft.getCategory())
                    .spec(draft.getDescriptionSnapshot())
                    .suggestedPriceLkr(draft.getSuggestedPriceLkr())
                    .status(draft.getStatus())
                    .mainImageUrl(imageUrl) // <-- THIS IS THE FIX: Set the image URL in the DTO
                    .build();
        }).collect(Collectors.toList());
    }

    public List<GemListingDTO> getActiveListingsForAdmin() {
        return listingRepo.findByStatus(MarketplaceListing.ListingStatus.ACTIVE)
                .stream()
                .map(this::toGemDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateListingPrice(Long listingId, BigDecimal newPrice) {
        MarketplaceListing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));
        listing.setPriceLkr(newPrice);
        listing.setUpdatedAt(java.time.LocalDateTime.now());
        listingRepo.save(listing);
    }

    @Transactional
    public void deleteListing(Long listingId) {
        // 1. Find the listing
        MarketplaceListing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        // 2. Get the linked inventory item and the draft
        InventoryItem item = listing.getInventoryItem();
        MarketplaceListingDraft draft = listing.getDraft(); // We need to delete this too

        // 3. Update the Inventory Item status back to IN_STOCK
        if (item != null) {
            item.setStatus(InventoryItem.Status.IN_STOCK);
            inventoryItemRepo.save(item);
        }

        // 4. Delete the active listing
        listingRepo.delete(listing);

        // 5. Delete the draft record
        // This removes the unique constraint block so the gem can be pushed again
        if (draft != null) {
            draftRepo.delete(draft);
        }
    }


    @Transactional
    public void publishGem(Long draftId, BigDecimal adminPrice) {
        MarketplaceListingDraft draft = draftRepo.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        InventoryItem inventory = draft.getInventoryItem();

        // 1. Ensure we have a ColorTone (fallback to OTHER)
        ColorTone tone = ColorTone.OTHER;
        if (inventory.getValidationReport() != null && inventory.getValidationReport().getColorTone() != null) {
            tone = inventory.getValidationReport().getColorTone();
        }

        // 2. Build the listing EXPLICITLY
        MarketplaceListing listing = MarketplaceListing.builder()
                .draft(draft)
                .inventoryItem(inventory)
                .gemstoneName(draft.getGemstoneName())
                .category(draft.getCategory())
                .description(inventory.getDescription())
                .priceLkr(adminPrice)
                .mainImageUrl(getPrimaryImage(inventory))
                .colorTone(tone)             // Explicitly set
                .origin("Sri Lanka")         // Explicitly set to satisfy NOT NULL
                .publishedAt(LocalDateTime.now())
                .status(MarketplaceListing.ListingStatus.ACTIVE)
                .build();

        listingRepo.save(listing);
        InventoryItem item = draft.getInventoryItem();
        item.setStatus(InventoryItem.Status.PUBLISHED); // This updates the SQL table
        inventoryItemRepo.save(item);

        // 3. Mark draft as APPROVED (Fixing the crash here!)
        draft.setStatus("APPROVED"); // ❌ Used to be "PUBLISHED"
        draft.setAdminPriceLkr(adminPrice);
        draftRepo.save(draft);
    }

    /** Helper to find the image in the inventory system */
    private String getPrimaryImageFromInventory(InventoryItem item) {
        if (item.getImages() == null || item.getImages().isEmpty()) {
            return "/gem-photos/default.jpg";
        }

        String path = item.getImages().get(0).getImagePath();

        // Ensure path starts with / so browser goes to localhost:8080/uploads
        // instead of localhost:8080/inventory-component/uploads
        if (path != null && !path.startsWith("/")) {
            return "/" + path;
        }
        return path;
    }
    // Inside MarketplaceService.java

    /**
     * Creates a new draft from the inventory item.
     */
    public void createDraft(DraftRequestDto dto) {
        MarketplaceListingDraft draft = new MarketplaceListingDraft();

        // Use the exact field names from your Dto
        InventoryItem item = inventoryItemRepo.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        draft.setInventoryItem(item);
        draft.setGemstoneName(dto.getGemstoneName());
        draft.setCategory(dto.getCategory());
        draft.setDescriptionSnapshot(dto.getDescriptionSnapshot());
        draft.setSuggestedPriceLkr(dto.getSuggestedPriceLkr());
        draft.setStatus("PENDING");

        draftRepo.save(draft);
    }

    /**
     * Marks a gem as sold in both the draft and inventory records.
     */
    /**
     * Marks a gem as sold in both the draft and inventory records.
     */
    @Transactional
    public void markAsSold(Long draftId) {
        MarketplaceListingDraft draft = draftRepo.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        // Keep the draft status safely within the allowed database limits
        draft.setStatus("APPROVED"); // ❌ Used to be "SOLD"

        if (draft.getInventoryItem() != null) {
            // It is completely fine to set the Inventory Item to SOLD,
            // because the Inventory table has a different set of allowed words!
            draft.getInventoryItem().setStatus(InventoryItem.Status.SOLD);
        }

        draftRepo.save(draft);
    }
    // Update this method in MarketplaceService.java
    // In MarketplaceService.java
    private GemListingDTO toGemDTO(MarketplaceListing l) {
        // Standardize the image URL path
        String imageUrl = l.getMainImageUrl();
        if (imageUrl != null && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
            imageUrl = "/gem-photos/" + imageUrl;
        }

        // 🟢 NEW: Check if the underlying inventory item was marked as SOLD
        String currentStatus = "ACTIVE";
        if (l.getInventoryItem() != null && l.getInventoryItem().getStatus() != null) {
            currentStatus = l.getInventoryItem().getStatus().name();
        }

        return GemListingDTO.builder()
                .listingId(l.getListingId())
                .name(l.getGemstoneName())
                .category(l.getCategory())
                .description(l.getDescription())
                .price(l.getPriceLkr())
                .mainImageUrl(imageUrl != null ? imageUrl : "/gem-photos/default.jpg")
                .colorTone(l.getColorTone() != null ? l.getColorTone().name() : "OTHER")
                .origin(l.getOrigin() != null ? l.getOrigin() : "Sri Lanka")
                // Fetch weight from the linked inventory item
                .caratWeight(l.getInventoryItem() != null ?
                        l.getInventoryItem().getWeightCt().doubleValue() : 0.0)
                // 🟢 NEW: Send the status to the frontend!
                .status(currentStatus)
                .build();
    }



    private String resolveDefaultImagePath(String gemstoneName) {
        if (gemstoneName == null) return "/gem-photos/default.jpg";
        String name = gemstoneName.toLowerCase();
        if (name.contains("blue ceylon sapphire")) return "/gem-photos/image1.jpg";
        if (name.contains("ruby"))                 return "/gem-photos/image2.jpg";
        if (name.contains("zambian emerald"))      return "/gem-photos/image3.jpg";
        if (name.contains("padparadscha"))         return "/gem-photos/image4.jpg";
        if (name.contains("yellow sapphire"))      return "/gem-photos/image5.jpg";
        if (name.contains("pink sapphire"))        return "/gem-photos/image6.jpg";
        if (name.contains("star sapphire"))        return "/gem-photos/image7.jpg";
        if (name.contains("teal sapphire"))        return "/gem-photos/image8.jpg";
        return "/gem-photos/default.jpg";
    }

    private String getPrimaryImage(InventoryItem item) {
        if (item == null || item.getImages() == null || item.getImages().isEmpty()) {
            return "/gem-photos/default.jpg";
        }

        // Attempt to find the primary image path
        String path = item.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(InventoryImage::getImagePath)
                .findFirst()
                .orElse(item.getImages().get(0).getImagePath());

        if (path == null) return "/gem-photos/default.jpg";

        // Ensure the path is correctly formatted for the frontend
        if (!path.startsWith("/") && !path.startsWith("http")) {
            return "/gem-photos/" + path;
        }
        return path;
    }
} // This should be the final closing brace. No more characters after this.

