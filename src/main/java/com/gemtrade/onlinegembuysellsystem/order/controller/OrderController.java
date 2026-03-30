package com.gemtrade.onlinegembuysellsystem.order.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderRequest;
import com.gemtrade.onlinegembuysellsystem.order.repository.CourierShippingConfigRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.InsuranceRiskConfigRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.OrderRepository;
import com.gemtrade.onlinegembuysellsystem.order.service.OrderService;
import com.gemtrade.onlinegembuysellsystem.order.util.OrderUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List; // Fixes "cannot find symbol: class List"
import com.gemtrade.onlinegembuysellsystem.order.entity.Order; // Fixes "cannot find symbol: class Order"
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {


    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest req) {
        // Spring will now automatically check the data in 'req'
        return ResponseEntity.ok(orderService.createOrderWithCustomerAndDelivery(
                req.getOrderDTO(),
                req.getCustomerDTO()
        ));
    }

    // Add this to your OrderController.java
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order " + id + " deleted successfully");
    }

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    // INJECT DEPENDENCIES NEEDED BY ORDERUTIL
    @Autowired
    private InventoryItemService inventoryItemService;

    @Autowired
    private CourierShippingConfigRepository courierRepository;

    @Autowired
    private InsuranceRiskConfigRepository insuranceRepository;

    @PostMapping("/viewTotal")
    public ResponseEntity<OrderDTO> viewTotal(@RequestBody OrderRequest req) {
        OrderDTO orderDTO = createOrderDTO(req.getOrderDTO());
        return ResponseEntity.ok(orderDTO);
    }

    private OrderDTO createOrderDTO(OrderDTO orderDTO) {
        // PASS the dependencies to the static method
        OrderUtil.calculateOrder(
                orderDTO,
                inventoryItemService,
                courierRepository,
                insuranceRepository
        );
        return orderDTO;
    }
}