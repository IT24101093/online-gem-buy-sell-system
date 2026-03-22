package com.gemtrade.onlinegembuysellsystem.order.entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Customer")
@Data               // Generates Getters, Setters, toString, etc.
@NoArgsConstructor  // Generates empty constructor
@AllArgsConstructor // Generates constructor with all fields
@Builder            // Allows you to create objects easily (Customer.builder().name(...).build())
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String lastName;
    private String firstName;
    private String deliveryAddress;
    private String contactNo;
    private String nic;
    private Integer age;



}