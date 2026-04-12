package com.gemtrade.onlinegembuysellsystem.payment.controller;

import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import com.gemtrade.onlinegembuysellsystem.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody PaymentTransaction payment) {
        try {
            // Let the service validate and process the payment securely
            PaymentTransaction savedPayment = service.processPayment(payment);
            return ResponseEntity.ok(savedPayment);
        } catch (IllegalArgumentException e) {
            // If the math is wrong or card is fake, return a 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics/monthly")
    public Map<String, BigDecimal> getReport(@RequestParam int month, @RequestParam int year) {
        return service.getMonthlyReport(month, year);
    }

    @GetMapping("/{id}")
    public PaymentTransaction getPaymentById(@PathVariable Long id) {
        return service.findById(id);
    }
}