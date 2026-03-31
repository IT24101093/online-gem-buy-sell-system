package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.gemtrade.onlinegembuysellsystem.seller.entity.Seller; // Updated import

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByNic(String nic);
}