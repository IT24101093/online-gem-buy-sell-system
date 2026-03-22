package com.gemtrade.onlinegembuysellsystem.order.dto;


import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    // Customer Info
    private String fullName;
    private String nic;
    private String contactNo;
    private String address;
    private Integer age;

    // Order Info
    private List<Long> gemIds; // List of inventory_item_id from your teammate's part
    private Double totalAmount;
    private String deliveryType;
    private Long insuranceAgentId;

}
