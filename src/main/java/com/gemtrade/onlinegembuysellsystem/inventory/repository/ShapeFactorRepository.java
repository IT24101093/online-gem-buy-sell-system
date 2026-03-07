package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.ShapeFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShapeFactorRepository extends JpaRepository<ShapeFactor, Long> {
    Optional<ShapeFactor> findByShapeIgnoreCase(String shape);
}