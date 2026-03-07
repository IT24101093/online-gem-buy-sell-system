package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.SpecificGravity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpecificGravityRepository extends JpaRepository<SpecificGravity, Long> {
    Optional<SpecificGravity> findByMaterialIgnoreCase(String material);
}