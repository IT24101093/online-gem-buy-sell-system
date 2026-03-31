package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport.ColorTone;
import com.gemtrade.onlinegembuysellsystem.marketplace.entity.MarketplaceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, Long> {

    List<MarketplaceListing> findByStatus(MarketplaceListing.ListingStatus status);

    // ── Original filter (price + color + search) ─────────────────────────────
    @Query("SELECT l FROM MarketplaceListing l WHERE l.status = 'ACTIVE' " +
           "AND (:search IS NULL OR LOWER(l.gemstoneName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:minPrice IS NULL OR l.priceLkr >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.priceLkr <= :maxPrice) " +
           "AND (:color IS NULL OR l.colorTone = :color)")
    List<MarketplaceListing> searchAndFilter(
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("color") ColorTone color);

    // ── Extended filter: adds carat range + origin  ───────────────
    @Query("SELECT DISTINCT l FROM MarketplaceListing l " +
           "LEFT JOIN l.inventoryItem inv " +
           "WHERE l.status = 'ACTIVE' " +
           "AND (:search IS NULL OR LOWER(l.gemstoneName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(l.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:minPrice IS NULL OR l.priceLkr >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.priceLkr <= :maxPrice) " +
           "AND (:color IS NULL OR l.colorTone = :color) " +
           "AND (:minCarat IS NULL OR inv.weightCt >= :minCarat) " +
           "AND (:maxCarat IS NULL OR inv.weightCt <= :maxCarat) " +
           "AND (:origin IS NULL OR LOWER(l.origin) = LOWER(:origin))")
    List<MarketplaceListing> searchAndFilterFull(
            @Param("search")    String search,
            @Param("minPrice")  BigDecimal minPrice,
            @Param("maxPrice")  BigDecimal maxPrice,
            @Param("color")     ColorTone color,
            @Param("minCarat")  BigDecimal minCarat,
            @Param("maxCarat")  BigDecimal maxCarat,
            @Param("origin")    String origin);

    // ── Suggestion query: active gems matching color tone and price range ─────
    @Query("SELECT l FROM MarketplaceListing l WHERE l.status = 'ACTIVE' " +
           "AND (:color IS NULL OR l.colorTone = :color) " +
           "AND (:minPrice IS NULL OR l.priceLkr >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.priceLkr <= :maxPrice) " +
           "ORDER BY l.publishedAt DESC")
    List<MarketplaceListing> findForSuggestion(
            @Param("color")    ColorTone color,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
}