package com.gemtrade.onlinegembuysellsystem.order.repository;

import com.gemtrade.onlinegembuysellsystem.order.entity.CourierShippingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourierShippingConfigRepository extends JpaRepository<CourierShippingConfig, Long> {

    Optional<CourierShippingConfig> findByRegionName(String regionName);
}
