package com.gemtrade.onlinegembuysellsystem.marketplace.service;

import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemListingDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.GemVariantDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.MarketplaceDraftDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.dto.SuggestionRequestDTO;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.*;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.GemCaratVariantRepository;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.MarketplaceListingDraftRepository;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.MarketplaceListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceListingRepository listingRepo;
    private final MarketplaceListingDraftRepository draftRepo;
    private final InventoryItemRepository inventoryRepo;
    private final GemCaratVariantRepository variantRepo;   // NEW – Feature 3

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
        return draftRepo.findByStatus(MarketplaceListingDraft.DraftStatus.PENDING)
                .stream()
                .map(d -> MarketplaceDraftDTO.builder()
                        .draftId(d.getDraftId())
                        .gemstoneName(d.getGemstoneName())
                        .category(d.getCategory())
                        .spec((d.getInventoryItem().getWeightCt() != null
                                ? d.getInventoryItem().getWeightCt() + "ct " : "") +
                                d.getInventoryItem().getGemType())
                        .suggestedPrice(d.getSuggestedPriceLkr())
                        .build())
                .collect(Collectors.toList());
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
        if (!listingRepo.existsById(listingId)) {
            throw new RuntimeException("Listing not found: " + listingId);
        }
        listingRepo.deleteById(listingId);
    }

    @Transactional
    public void publishGem(Long draftId, BigDecimal adminPrice) {
        MarketplaceListingDraft draft = draftRepo.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found: " + draftId));

        InventoryItem item = draft.getInventoryItem();
        item.setStatus(InventoryItem.InventoryStatus.PUBLISHED);

        if (item.getImages() == null || item.getImages().isEmpty()) {
            InventoryImage img = new InventoryImage();
            img.setInventoryItem(item);
            img.setImagePath(resolveDefaultImagePath(draft.getGemstoneName()));
            img.setIsPrimary(true);
            img.setSortOrder(0);
            item.getImages().add(img);
        }

        MarketplaceListing listing = new MarketplaceListing();
        listing.setDraft(draft);
        listing.setInventoryItem(item);
        listing.setGemstoneName(draft.getGemstoneName());
        listing.setCategory(draft.getCategory());
        listing.setDescription(draft.getDescriptionSnapshot());
        listing.setPriceLkr(adminPrice);
        listing.setMainImageUrl(getPrimaryImage(item));

        if (item.getValidationReport() != null) {
            listing.setColorTone(item.getValidationReport().getColorTone());
        } else {
            listing.setColorTone(ColorTone.OTHER);
        }

        listing.setStatus(MarketplaceListing.ListingStatus.ACTIVE);

        draft.setStatus(MarketplaceListingDraft.DraftStatus.APPROVED);
        draft.setAdminPriceLkr(adminPrice);

        listingRepo.save(listing);
        draftRepo.save(draft);
        inventoryRepo.save(item);
    }
    private GemListingDTO toGemDTO(MarketplaceListing l) {
        return GemListingDTO.builder()
                .listingId(l.getListingId())
                .name(l.getGemstoneName())
                .category(l.getCategory())
                .description(l.getDescription())
                .price(l.getPriceLkr())
                .mainImageUrl(l.getMainImageUrl())
                .colorTone(l.getColorTone().name())
                .caratWeight(l.getInventoryItem() != null && l.getInventoryItem().getWeightCt() != null
                        ? l.getInventoryItem().getWeightCt().doubleValue() : 0.0)
                .origin(l.getOrigin())
                .build();
    }

    private String getPrimaryImage(InventoryItem item) {
        return item.getImages().stream()
                .filter(InventoryImage::getIsPrimary)
                .findFirst()
                .map(InventoryImage::getImagePath)
                .orElse("/gem-photos/default.jpg");
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
}