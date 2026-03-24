package com.gemtrade.onlinegembuysellsystem.marketplace.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GemVariantDTO {


    private Long variantId;

    private BigDecimal caratValue;

    private BigDecimal priceLkr;


}
