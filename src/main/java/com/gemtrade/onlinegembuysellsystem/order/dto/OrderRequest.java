package com.gemtrade.onlinegembuysellsystem.order.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class OrderRequest {
    private String name;
    private String phone;
    private String nic;
    private String address;
    private Integer age;
    private Double amount;
    private String deliveryType; // For Sir's Modification
    private Long insuranceAgentId;
    @Getter
    @Setter
    private CustomerDTO customerDTO;// For Sir's Modification
    private OrderDTO orderDTO;

    public CustomerDTO getCustomerDetails() {
        return customerDTO;
    }

    public void setCustomerDetails(CustomerDTO customerDTO) {
        this.customerDTO = customerDTO;
    }

}

