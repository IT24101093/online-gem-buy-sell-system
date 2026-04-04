package com.gemtrade.onlinegembuysellsystem.cart.repository;

import com.gemtrade.onlinegembuysellsystem.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
}