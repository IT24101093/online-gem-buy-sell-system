package com.gemtrade.onlinegembuysellsystem.cart.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDto {
    private Long cartItemId;
    private Long listingId;
    private String gemName;
    private BigDecimal unitPriceLkr;
    private String imageUrl;
    private Long jewelleryId;
}