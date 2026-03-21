package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * JewelleryDTO – used for both:
 *   - Admin requests  (POST /api/admin/jewellery, PUT /.../jewellery/{id})
 *   - User responses  (GET /api/jewellery)
 *
 * Categories are plain Strings (e.g. ["Sapphire", "Ruby"]).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JewelleryDTO {

    /** Null on create; populated on update requests and all responses */
    private Long jewelleryId;

    @NotBlank(message = "Jewellery type is required")
    @Size(max = 60)
    private String jewelleryType;   // Ring, Pendant, Necklace, Earrings, Bracelet

    @NotBlank(message = "Metal colour is required")
    @Size(max = 40)
    private String metalColour;     // Gold, Silver, Platinum

    /** Relative URL path to the image stored under /static */
    private String imagePath;

    /** Price displayed on the user Jewellery page */
    private BigDecimal priceLkr;

    /** Featured gemstone name shown to users (e.g. "Blue Sapphire") */
    private String gemstoneName;

    private String description;

    /** List of gem category names suitable for this jewellery piece */
    private List<String> gemCategories;
}
