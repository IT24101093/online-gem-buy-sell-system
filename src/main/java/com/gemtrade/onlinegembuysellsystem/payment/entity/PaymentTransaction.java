package com.gemtrade.onlinegembuysellsystem.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Long orderId;

    private BigDecimal subtotalLkr;
    private BigDecimal addonsLkr;
    private BigDecimal shippingLkr;
    private BigDecimal taxLkr;
    private BigDecimal discountLkr;
    private BigDecimal totalAmountLkr;

    private String method;
    private String status;

    private String gatewayReference;

    private LocalDateTime createdAt;
    //private LocalDateTime updatedAt;

    private String gatewayName;

    @Transient
    private String cardNumber;
}
