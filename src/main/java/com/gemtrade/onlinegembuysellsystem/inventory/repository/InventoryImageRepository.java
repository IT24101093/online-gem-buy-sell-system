package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryImageRepository extends JpaRepository<InventoryImage, Long> {

    // Get all images for an item in display order
    List<InventoryImage> findByInventoryItem_InventoryItemIdOrderBySortOrderAsc(Long inventoryItemId);

    // Used to keep images in order (next image gets max+1 sort order)
    @Query("select coalesce(max(i.sortOrder), 0) from InventoryImage i where i.inventoryItem.inventoryItemId = :itemId")
    Integer findMaxSortOrder(@Param("itemId") Long itemId);

    // Used to check if this is the first image (then we auto-make it primary)
    @Query("select count(i) from InventoryImage i where i.inventoryItem.inventoryItemId = :itemId")
    long countByItemId(@Param("itemId") Long itemId);

    // Used to make sure only one image is primary for an item (DB unique constraint)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update InventoryImage i set i.isPrimary = false where i.inventoryItem.inventoryItemId = :itemId and i.isPrimary = true")
    int unsetPrimaryForItem(@Param("itemId") Long itemId);

    // Gets the primary image record for an inventory item (empty if no image uploaded yet)
    Optional<InventoryImage> findFirstByInventoryItem_InventoryItemIdAndIsPrimaryTrue(Long inventoryItemId);

    // Fetch primary images for multiple items in one query (efficient for listing)
    List<InventoryImage> findByInventoryItem_InventoryItemIdInAndIsPrimaryTrue(List<Long> inventoryItemIds);
}