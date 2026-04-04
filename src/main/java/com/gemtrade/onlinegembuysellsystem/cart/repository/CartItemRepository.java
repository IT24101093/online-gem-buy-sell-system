package com.gemtrade.onlinegembuysellsystem.cart.repository;

import com.gemtrade.onlinegembuysellsystem.cart.entity.Cart;
import com.gemtrade.onlinegembuysellsystem.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Add this line to fetch all items belonging to the user's cart
    List<CartItem> findByCart_CartId(Long cartId);
    long countByCart(Cart cart);
}

