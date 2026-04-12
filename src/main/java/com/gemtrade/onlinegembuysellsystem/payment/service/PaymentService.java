package com.gemtrade.onlinegembuysellsystem.payment.service;

import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import com.gemtrade.onlinegembuysellsystem.payment.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentTransactionRepository repository;

    public PaymentService(PaymentTransactionRepository repository) {
        this.repository = repository;
    }

    public PaymentTransaction processPayment(PaymentTransaction payment) {
        // 1. Math Validation (Ensures price integrity)
        BigDecimal expectedTotal = payment.getSubtotalLkr()
                .add(payment.getAddonsLkr())
                .add(payment.getShippingLkr())
                .add(payment.getTaxLkr())
                .subtract(payment.getDiscountLkr());

        if (expectedTotal.compareTo(payment.getTotalAmountLkr()) != 0) {
            throw new IllegalArgumentException("Security Alert: Payment math mismatch.");
        }

        // 2. Logic based on payment method
        if ("CARD".equalsIgnoreCase(payment.getMethod())) {
            // Check card number using Luhn algorithm
            if (!isValidLuhn(payment.getCardNumber())) {
                throw new IllegalArgumentException("Invalid Credit Card Number.");
            }
            payment.setStatus("SUCCESS");
        }
        else if ("CASH".equalsIgnoreCase(payment.getMethod())) {
            payment.setStatus("PENDING"); // Cash is pending until delivery

            // Fix for the SQL "gateway_name cannot be null" error
            // We set these manually since there is no online gateway for Cash
            payment.setGatewayName("Cash On Delivery");
            payment.setGatewayReference("COD-" + System.currentTimeMillis());
        }

        // 3. Set timestamp and Save (No setUpdatedAt used here)
        payment.setCreatedAt(LocalDateTime.now());

        return repository.save(payment);
    }
    public PaymentTransaction findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public boolean isValidLuhn(String cardNumber) {
        if (cardNumber == null || cardNumber.trim().isEmpty()) return false;

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

    public Map<String, BigDecimal> getMonthlyReport(int month, int year) {
        List<PaymentTransaction> transactions = repository.findAll();

        BigDecimal income = transactions.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                // FIX: Actually applying the date filter now!
                .filter(p -> p.getCreatedAt() != null &&
                        p.getCreatedAt().getMonthValue() == month &&
                        p.getCreatedAt().getYear() == year)
                .map(PaymentTransaction::getTotalAmountLkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal loss = BigDecimal.ZERO;
        BigDecimal balance = income.subtract(loss);

        Map<String, BigDecimal> report = new HashMap<>();
        report.put("income", income);
        report.put("loss", loss);
        report.put("balance", balance);

        return report;
    }
}