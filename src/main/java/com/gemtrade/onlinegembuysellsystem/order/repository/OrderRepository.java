
package com.gemtrade.onlinegembuysellsystem.order.repository;

import com.gemtrade.onlinegembuysellsystem.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // This feeds your 4 Admin Dashboard Tiles;
}

