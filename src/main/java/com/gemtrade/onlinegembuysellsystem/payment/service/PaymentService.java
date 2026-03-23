package com.gemtrade.onlinegembuysellsystem.payment.service;

import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import com.gemtrade.onlinegembuysellsystem.payment.repository.PaymentTransactionRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentTransactionRepository repo;

    public PaymentService(PaymentTransactionRepository repo) {
        this.repo = repo;
    }

    public PaymentTransaction save(PaymentTransaction payment) {

        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return repo.save(payment);
    }

    public PaymentTransaction findById(Long id) {
        return repo.findById(id).orElse(null);
    }
}
