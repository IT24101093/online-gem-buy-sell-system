package com.gemtrade.onlinegembuysellsystem.order.controller;

import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.order.service.DeliveryServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-services")
public class DeliveryServiceController {

    @Autowired
    private DeliveryServiceService service;

    // GET all delivery services
    @GetMapping
    public List<DeliveryService> getAll() {
        return service.getAllDeliveryServices();
    }
}