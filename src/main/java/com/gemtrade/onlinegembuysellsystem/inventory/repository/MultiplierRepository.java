package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.Multiplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MultiplierRepository extends JpaRepository<Multiplier, Long> {
    Optional<Multiplier> findByCategoryAndGradeCodeIgnoreCase(Multiplier.Category category, String gradeCode);
}