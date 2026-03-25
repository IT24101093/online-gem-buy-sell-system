package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.GemCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GemCertificateRepository extends JpaRepository<GemCertificate, Long> {
    // Searches the database for a certificate using the exact certificate number string (e.g., "GIA-12345")
    Optional<GemCertificate> findByCertificateNo(String certificateNo);

    // Searches the database for a certificate using the ID number of the Inventory Item it is attached to
    Optional<GemCertificate> findByInventoryItem_InventoryItemId(Long inventoryItemId);
}
