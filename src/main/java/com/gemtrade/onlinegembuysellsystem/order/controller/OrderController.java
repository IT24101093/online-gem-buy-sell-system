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

import java.util.HashMap;
import java.util.List; // Fixes "cannot find symbol: class List"
import java.util.Map;
import java.util.stream.Collectors;

import com.gemtrade.onlinegembuysellsystem.order.entity.Order; // Fixes "cannot find symbol: class Order"
import jakarta.validation.Valid;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderResponseDTO;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {


    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createOrder(@Valid @RequestBody OrderRequest req) {
        // 1. Save the order to the database using your existing service method
        Order savedOrder = orderService.createOrderWithCustomerAndDelivery(
                req.getOrderDTO(),
                req.getCustomerDTO()
        );

        // 2. Return a simple, safe JSON response instead of the entire Entity graph!
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order placed successfully");
        response.put("orderId", String.valueOf(savedOrder.getOrderId()));

        return ResponseEntity.ok(response);
    }

    // Add this to your OrderController.java
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> response = orderService.getAllOrders().stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setOrderId(order.getOrderId());
            dto.setStatus(order.getOrderStatus());
            dto.setAmount(order.getTotalAmountLkr().doubleValue());

            // Joining Customer Data
            if (order.getCustomer() != null) {
                dto.setCustomerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
                // Add these setters if you update your OrderResponseDTO.java
                // dto.setContactNo(order.getCustomer().getContactNo());
                // dto.setAddress(order.getCustomer().getDeliveryAddress());
            }

            // Joining Inventory/Gem Data
            if (order.getInventoryItem() != null) {
                dto.setGemsList(order.getInventoryItem().getGemType() + " (" + order.getInventoryItem().getWeightCt() + "ct)");
            }

            dto.setDate(order.getCreatedAt().toLocalDate().toString());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
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