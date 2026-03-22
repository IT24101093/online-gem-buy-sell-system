package com.gemtrade.onlinegembuysellsystem.order.repository;

import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryServiceRepository extends JpaRepository<DeliveryService, Long> {
    List<DeliveryService> findByStatus(String status);
}
