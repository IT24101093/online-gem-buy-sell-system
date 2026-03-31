package com.gemtrade.onlinegembuysellsystem.seller.entity; // The new shared home

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller")
@Getter
@Setter
@NoArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seller_id")
    private Long sellerId;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "nic", nullable = false, unique = true, length = 20)
    private String nic;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}