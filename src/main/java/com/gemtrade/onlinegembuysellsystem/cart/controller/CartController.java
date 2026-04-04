package com.gemtrade.onlinegembuysellsystem.cart.controller;

import com.gemtrade.onlinegembuysellsystem.cart.dto.AddToCartRequest;
import com.gemtrade.onlinegembuysellsystem.cart.dto.CartItemDto;
import com.gemtrade.onlinegembuysellsystem.cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Long>> addToCart(@RequestBody AddToCartRequest request) {
        Long activeCartId = cartService.addItemToCart(request);

        // Return a JSON object like { "cartId": 12 }
        Map<String, Long> response = new HashMap<>();
        response.put("cartId", activeCartId);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{cartId}")
    public ResponseEntity<List<CartItemDto>> getCartItems(@PathVariable Long cartId) {
        List<CartItemDto> items = cartService.getCartItems(cartId);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            cartService.removeLineItem(id);
            return ResponseEntity.ok().body("Item removed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


}



