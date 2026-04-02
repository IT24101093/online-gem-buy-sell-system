package com.gemtrade.onlinegembuysellsystem.order.service;

// --- Spring Framework Imports ---
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

// --- DTO Imports ---
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.CustomerDTO;

// --- Entity Imports ---
import com.gemtrade.onlinegembuysellsystem.order.entity.Order;
import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;
import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;

// --- Repository & Service Imports ---
import com.gemtrade.onlinegembuysellsystem.order.repository.OrderRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.CustomerRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.DeliveryServiceRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.CourierShippingConfigRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.InsuranceRiskConfigRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;

// --- Utility Import ---
import com.gemtrade.onlinegembuysellsystem.order.util.OrderUtil;

import java.time.LocalDateTime;
import java.util.List; // <--- Add this line

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeliveryServiceRepository deliveryServiceRepository;

    @Autowired
    private InventoryItemService inventoryItemService;

    @Autowired
    private CourierShippingConfigRepository courierRepository;

    @Autowired
    private InsuranceRiskConfigRepository insuranceRepository;

    @Autowired
    private InventoryItemRepository inventoryRepository;

    public Order createOrderWithCustomerAndDelivery(OrderDTO dto, CustomerDTO customerDTO) {
        // 1. Calculate fees and total
        OrderUtil.calculateOrder(dto, inventoryItemService, courierRepository, insuranceRepository);

        // 2. Save Customer
        Customer customer = new Customer();
        BeanUtils.copyProperties(customerDTO, customer);
        customer = customerRepository.save(customer);

        // 3. Get Delivery Service
        DeliveryService deliveryService = null;
        if (dto.getDeliveryServiceId() != null) {
            deliveryService = deliveryServiceRepository.findById(dto.getDeliveryServiceId())
                    .orElseThrow(() -> new RuntimeException("Delivery service not found"));
        }

        // 4. Get Inventory Item
        InventoryItem inventoryItem = inventoryRepository.findById(dto.getInventoryId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        // 5. Create Order
        Order order = new Order();
        order.setCustomer(customer);
        order.setDeliveryService(deliveryService);
        order.setInventoryItem(inventoryItem);

        order.setDeliveryFee(dto.getDeliveryFee());
        order.setInsuranceFee(dto.getInsuranceFee());
        order.setTotalAmountLkr(dto.getTotalAmountLkr());
        order.setOrderStatus("CONFIRMED");

        return orderRepository.save(order);
    }

    // Add this to your OrderService.java
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Ensure status is stored in Uppercase for consistency
        String upperStatus = status.toUpperCase();
        order.setOrderStatus(upperStatus);

        if ("PACKED".equals(upperStatus)) {
            order.setPackedAt(LocalDateTime.now());
        } else if ("DELIVERED".equals(upperStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }
    //manages order status updates & deletion.
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }


}