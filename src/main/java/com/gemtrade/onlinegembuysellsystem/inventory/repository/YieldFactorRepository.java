package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.YieldFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface YieldFactorRepository extends JpaRepository<YieldFactor, Long> {
    Optional<YieldFactor> findByRoughShapeIgnoreCase(String roughShape);
}