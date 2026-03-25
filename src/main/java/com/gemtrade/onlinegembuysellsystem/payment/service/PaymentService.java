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

    public boolean isValidLuhn(String cardNumber) {
        if (cardNumber == null) return false;

        // Remove any spaces sent from the frontend [cite: 1035]
        String digits = cardNumber.replaceAll("\\D", "");
        if (digits.length() < 13) return false;

        int sum = 0;
        boolean shouldDouble = false;

        for (int i = digits.length() - 1; i >= 0; i--) {
            int d = Integer.parseInt(digits.substring(i, i + 1));
            if (shouldDouble) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10 == 0);
    }

}
