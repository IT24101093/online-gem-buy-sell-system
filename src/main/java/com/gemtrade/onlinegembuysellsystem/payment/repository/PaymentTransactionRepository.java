package com.gemtrade.onlinegembuysellsystem.payment.repository;

import com.gemtrade.onlinegembuysellsystem.payment.repository.PaymentTransactionRepository;
import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {
}




