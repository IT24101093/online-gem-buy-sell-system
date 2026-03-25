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

    // ...Another methods (isValidLuhn etc.) ...

    public PaymentTransaction save(PaymentTransaction payment) {

        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return repository.save(payment);
    }

    public PaymentTransaction findById(Long id) {
        return repository.findById(id).orElse(null);
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

    public Map<String, BigDecimal> getMonthlyReport(int month, int year) {
        // get the all payment records in each month
        List<PaymentTransaction> transactions = repository.findAll();

        BigDecimal income = transactions.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                //filtering with date field
                .map(PaymentTransaction::getTotalAmountLkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal loss = BigDecimal.ZERO; // still now the loss value is 0
        BigDecimal balance = income.subtract(loss);

        Map<String, BigDecimal> report = new HashMap<>();
        report.put("income", income);
        report.put("loss", loss);
        report.put("balance", balance);

        return report;
    }

}
