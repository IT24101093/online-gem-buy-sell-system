package com.gemtrade.onlinegembuysellsystem.cart.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddToCartRequest {
    private Long cartId;       // Null if this is the user's first item!
    private Long listingId;    // The Marketplace ID
    private String gemName;
    private BigDecimal unitPriceLkr;
    private Long jewelleryId;
}