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

        System.out.println("Incoming Payment: " + payment);

        payment.setStatus("SUCCESS");
        payment.setMethod(payment.getMethod()); // keep frontend value

        return service.save(payment);
    }

    @GetMapping("/{id}")
    public PaymentTransaction getPaymentById(@PathVariable Long id) {
        return service.findById(id);
    }
}
