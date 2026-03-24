package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.marketplace.entity.JewelleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for JewelleryItem.
 * Includes a fetch-join query to load categories in one SQL call (avoids N+1).
 */
public interface JewelleryItemRepository extends JpaRepository<JewelleryItem, Long> {

    /** Fetch all jewellery items with their gem categories eagerly loaded. */
    @Query("SELECT DISTINCT j FROM JewelleryItem j LEFT JOIN FETCH j.gemCategories ORDER BY j.createdAt DESC")
    List<JewelleryItem> findAllWithCategories();

    /** Filter by jewellery type (e.g. "Ring"). */
    @Query("SELECT DISTINCT j FROM JewelleryItem j LEFT JOIN FETCH j.gemCategories " +
            "WHERE LOWER(j.jewelleryType) = LOWER(:type)")
    List<JewelleryItem> findByTypeFetched(@Param("type") String type);
}
