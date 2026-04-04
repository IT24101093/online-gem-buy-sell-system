package com.gemtrade.onlinegembuysellsystem.cart.service;

import com.gemtrade.onlinegembuysellsystem.cart.dto.AddToCartRequest;
// (Assume you have basic Cart, CartItem entities and their Repositories based on your V1 schema)
import com.gemtrade.onlinegembuysellsystem.cart.dto.CartItemDto;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.JewelleryItemRepository;
import com.gemtrade.onlinegembuysellsystem.marketplace.repository.MarketplaceListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gemtrade.onlinegembuysellsystem.cart.repository.CartRepository;
import com.gemtrade.onlinegembuysellsystem.cart.repository.CartItemRepository;
import com.gemtrade.onlinegembuysellsystem.cart.entity.Cart;
import com.gemtrade.onlinegembuysellsystem.cart.entity.CartItem;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private MarketplaceListingRepository marketplaceListingRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private JewelleryItemRepository jewelleryItemRepository;




    @Transactional
    public Long addItemToCart(AddToCartRequest request) {
        Cart cart;

        // 1. Get or Create the Cart
        if (request.getCartId() == null) {
            cart = new Cart();
            cart.setStatus("ACTIVE");
            cart = cartRepository.save(cart);
        } else {
            cart = cartRepository.findById(request.getCartId())
                    .orElseGet(() -> {
                        Cart newCart = new Cart();
                        newCart.setStatus("ACTIVE");
                        return cartRepository.save(newCart);
                    });
        }

        // 2. PREVENT DUPLICATES: Check both Gems and Jewelry
        List<CartItem> currentItems = cartItemRepository.findByCart_CartId(cart.getCartId());

        boolean alreadyExists = currentItems.stream().anyMatch(item -> {
            // Check Gem Duplicate
            if (request.getListingId() != null && item.getListingId() != null) {
                return request.getListingId().equals(item.getListingId());
            }
            // Check Jewelry Duplicate
            if (request.getJewelleryId() != null && item.getJewelleryId() != null) {
                return request.getJewelleryId().equals(item.getJewelleryId());
            }
            return false;
        });

        // 3. Save if NOT present
        if (!alreadyExists) {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);

            // Map based on what is provided in the request
            newItem.setListingId(request.getListingId());   // Can be null
            newItem.setJewelleryId(request.getJewelleryId()); // Can be null

            newItem.setGemName(request.getGemName());
            newItem.setUnitPriceLkr(request.getUnitPriceLkr());

            cartItemRepository.save(newItem);
        } else {
            String itemId = (request.getListingId() != null) ? "Listing " + request.getListingId() : "Jewelry " + request.getJewelleryId();
            System.out.println(">>> SKIP: Item " + itemId + " already exists in Cart " + cart.getCartId());
        }

        return cart.getCartId();
    }

    // Add this with your other imports at the top:
    // import com.gemtrade.onlinegembuysellsystem.cart.dto.CartItemDto;
    // import java.util.List;
    // import java.util.stream.Collectors;

    public List<CartItemDto> getCartItems(Long cartId) {
        // 1. Fetch all items from the cart_item table
        List<CartItem> items = cartItemRepository.findByCart_CartId(cartId);

        return items.stream().map(item -> {
            CartItemDto dto = new CartItemDto();

            // Set basic fields that apply to both Gems and Jewelry
            dto.setCartItemId(item.getCartItemId());
            dto.setListingId(item.getListingId());
            dto.setJewelleryId(item.getJewelleryId()); // From your new V6 column
            dto.setGemName(item.getGemName());
            dto.setUnitPriceLkr(item.getUnitPriceLkr());

            // 2. Fetch the correct image based on which ID is present
            if (item.getListingId() != null) {
                // Logic for Gems (Marketplace Listings)
                marketplaceListingRepository.findById(item.getListingId())
                        .ifPresent(l -> dto.setImageUrl(l.getMainImageUrl()));
            } else if (item.getJewelleryId() != null) {
                // Logic for Jewelry (Using the new repository)
                jewelleryItemRepository.findById(item.getJewelleryId())
                        .ifPresent(j -> dto.setImageUrl(j.getImagePath()));
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void removeLineItem(Long cartItemId) {
        // 1. Find the item first to know which cart it belongs to
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        Cart cart = item.getCart();

        // 2. Perform the deletion
        cartItemRepository.delete(item);

        // 3. Check if the cart is now empty
        // You'll need to add: long countByCart(Cart cart); to your CartItemRepository
        if (cartItemRepository.countByCart(cart) == 0) {
            cartRepository.delete(cart);
            System.out.println("Cart ID " + cart.getId() + " was empty and has been removed.");
        }
    }
}
