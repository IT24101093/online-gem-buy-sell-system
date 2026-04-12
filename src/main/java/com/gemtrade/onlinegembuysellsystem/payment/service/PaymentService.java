package com.gemtrade.onlinegembuysellsystem.payment.service;

import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import com.gemtrade.onlinegembuysellsystem.payment.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

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
            if (!isValidLuhn(payment.getCardNumber())) {
                throw new IllegalArgumentException("Invalid Credit Card Number.");
            }
            payment.setStatus("SUCCESS");

            // --- THE TRIGGER ---
            // Since it's a SUCCESS, we move money from Liability to Asset
            fulfillFinancialTransaction(payment.getOrderId(), payment.getTotalAmountLkr().doubleValue());

        }
        else if ("CASH".equalsIgnoreCase(payment.getMethod())) {
            payment.setStatus("PENDING");
            payment.setGatewayName("Cash On Delivery");
            payment.setGatewayReference("COD-" + System.currentTimeMillis());

            // Note: We do NOT trigger fulfillFinancialTransaction here
            // because the cash hasn't been collected yet.
            // It stays in 'corporate_liabilities' (the Red Slice).
        }

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

    @Autowired
    private JdbcTemplate jdbcTemplate;


    @Transactional
    public void fulfillFinancialTransaction(Long orderId, Double amount) {
        try {
            // 1. Remove the pending liability from the corporate_liabilities table
            // We look for the description we created in OrderService
            String deleteLiabilitySql = "DELETE FROM corporate_liabilities WHERE description LIKE ?";
            jdbcTemplate.update(deleteLiabilitySql, "%Order #" + orderId + "%");

            // 2. Move the money to Corporate Assets (Cash at Bank)
            // We use an "Upsert" logic (Insert or Update if exists)
            String updateAssetSql = "INSERT INTO corporate_assets (name, category, value_lkr) " +
                    "VALUES ('Cash at Bank', 'CURRENT', ?) " +
                    "ON DUPLICATE KEY UPDATE value_lkr = value_lkr + ?";

            jdbcTemplate.update(updateAssetSql, amount, amount);

            System.out.println("Financial sync complete: Order #" + orderId + " moved to Assets.");

        } catch (Exception e) {
            // Log the error so you don't lose track of the money if the DB fails
            System.err.println("Finance Sync Error for Order " + orderId + ": " + e.getMessage());
        }
    }
}