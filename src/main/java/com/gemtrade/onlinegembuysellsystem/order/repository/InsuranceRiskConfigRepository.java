package com.gemtrade.onlinegembuysellsystem.order.repository;

import com.gemtrade.onlinegembuysellsystem.order.entity.InsuranceRiskConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuranceRiskConfigRepository extends JpaRepository<InsuranceRiskConfig, Long> {

    Optional<InsuranceRiskConfig> findByGemType(String gemType);
}
