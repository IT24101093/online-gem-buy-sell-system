package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.BasePricePerCarat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BasePricePerCaratRepository extends JpaRepository<BasePricePerCarat, Long> {
    List<BasePricePerCarat> findByGemTypeIgnoreCase(String gemType);
}