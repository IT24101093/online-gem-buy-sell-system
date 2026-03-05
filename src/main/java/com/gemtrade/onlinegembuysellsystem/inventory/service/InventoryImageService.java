package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.InventoryImageResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryImage;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryImageRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class InventoryImageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryImageRepository inventoryImageRepository;

    public InventoryImageService(InventoryItemRepository inventoryItemRepository,
                                 InventoryImageRepository inventoryImageRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryImageRepository = inventoryImageRepository;
    }

    @Transactional
    public InventoryImageResponseDto uploadItemImage(Long itemId, MultipartFile file, Boolean isPrimary) {

        // 1) Validate the request (file must exist and must be an image type).
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, WEBP images are allowed");
        }

        // 2) Check the inventory item exists (so we can link the image to a real gem record).
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found: " + itemId));

        boolean makePrimary = (isPrimary != null && isPrimary);

        // Simple rule: first image becomes primary automatically
        if (inventoryImageRepository.countByItemId(itemId) == 0) {
            makePrimary = true;
        }

        // 3) Save the image file into: uploads/items/{itemId}/ with a safe unique filename.
        String ext = extensionFromContentType(contentType);
        String filename = UUID.randomUUID() + ext;

        Path baseDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path itemDir = baseDir.resolve(Paths.get("items", String.valueOf(itemId))).normalize();

        // Safety check: ensure path stays inside uploads folder
        if (!itemDir.startsWith(baseDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }

        try {
            Files.createDirectories(itemDir);
            Path target = itemDir.resolve(filename).normalize();
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
        }

        // Build DB values (path stored + URL used by frontend)
        String relativePath = Paths.get(uploadDir, "items", String.valueOf(itemId), filename)
                .toString().replace("\\", "/");
        String imageUrl = "/" + relativePath; // served via WebMvcConfig at /uploads/**

        // 4) If this image should be primary, first remove the previous primary image
        //    (required because the DB allows only ONE primary image per item).
        if (makePrimary) {
            inventoryImageRepository.unsetPrimaryForItem(itemId);
        }

        // Used to keep images in order (next image gets max+1 sort order)
        Integer maxSort = inventoryImageRepository.findMaxSortOrder(itemId);
        int nextSort = (maxSort == null ? 0 : maxSort) + 1;

        // 5) Save a row in inventory_image with image_path, image_url, is_primary, and sort_order.
        InventoryImage img = new InventoryImage();
        img.setInventoryItem(item);
        img.setImagePath(relativePath);
        img.setImageUrl(imageUrl);
        img.setIsPrimary(makePrimary);
        img.setSortOrder(nextSort);

        InventoryImage saved = inventoryImageRepository.save(img);

        return new InventoryImageResponseDto(
                saved.getImageId(),
                itemId,
                saved.getIsPrimary(),
                saved.getSortOrder(),
                saved.getImagePath(),
                saved.getImageUrl()
        );
    }

    // Converts MIME content-type to a safe file extension
    private String extensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }
}