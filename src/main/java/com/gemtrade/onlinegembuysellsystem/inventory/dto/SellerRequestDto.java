package com.gemtrade.onlinegembuysellsystem.inventory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SellerRequestDto {
    private String name;
    private String nic;
    private String phone;
}