package com.gemtrade.onlinegembuysellsystem.payment.controller;

import com.gemtrade.onlinegembuysellsystem.payment.entity.PaymentTransaction;
import com.gemtrade.onlinegembuysellsystem.payment.service.PaymentService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public PaymentTransaction createPayment(@RequestBody PaymentTransaction payment) {
        // This ensures the data sent from app.js is actually passed to the service
        payment.setStatus("SUCCESS");
        return service.save(payment); // Ensure service.save is called here
    }

    @GetMapping("/{id}")
    public PaymentTransaction getPaymentById(@PathVariable Long id) {
        return service.findById(id);
    }
}
