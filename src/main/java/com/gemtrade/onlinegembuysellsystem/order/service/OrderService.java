package com.gemtrade.onlinegembuysellsystem.order.service;

import com.gemtrade.onlinegembuysellsystem.cart.entity.Cart;
import com.gemtrade.onlinegembuysellsystem.cart.entity.CartItem;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.CustomerDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.Order;
import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;
import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.order.repository.*;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.util.OrderUtil;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.gemtrade.onlinegembuysellsystem.cart.repository.CartRepository cartRepository;

    @Autowired
    private DeliveryServiceRepository deliveryServiceRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private InventoryItemService inventoryItemService;

    @Autowired
    private CourierShippingConfigRepository courierRepository;

    @Autowired
    private InsuranceRiskConfigRepository insuranceRepository;

    @Autowired
    private InventoryItemRepository inventoryRepository;

    @Transactional
    public Order createOrderWithCustomerAndDelivery(OrderDTO dto, CustomerDTO customerDTO) {
        // 1. Calculate fees using utility
        OrderUtil.calculateOrder(dto, inventoryItemService, courierRepository, insuranceRepository);

        // 2. Save Customer
        Customer customer = new Customer();
        BeanUtils.copyProperties(customerDTO, customer);
        customer = customerRepository.save(customer);

        // 3. Find Cart (Ensures it is managed by Hibernate)
        Cart cart = cartRepository.findById(dto.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found with ID: " + dto.getCartId()));

        // 4. Get Delivery Service
        DeliveryService deliveryService = null;
        if (dto.getDeliveryServiceId() != null) {
            deliveryService = deliveryServiceRepository.findById(dto.getDeliveryServiceId())
                    .orElseThrow(() -> new RuntimeException("Delivery service not found"));
        }

        // 5. Create Order Header
        Order order = new Order();
        order.setCustomer(customer);
        order.setCart(cart); // Link the cart
        order.setDeliveryService(deliveryService);

        // Reference primary inventory item for summary
        InventoryItem inventoryItem = inventoryRepository.findById(dto.getInventoryId()).orElse(null);
        order.setInventoryItem(inventoryItem);

        order.setDeliveryFee(dto.getDeliveryFee());
        order.setInsuranceFee(dto.getInsuranceFee());
        order.setTotalAmountLkr(dto.getTotalAmountLkr());
        order.setOrderStatus("CONFIRMED");

        // Save Order first to generate the ID for Step 6
        Order savedOrder = orderRepository.save(order);

        // 6. POPULATE order_item TABLE via JdbcTemplate (Option 1)
        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            String sql = "INSERT INTO order_item (order_id, listing_id, gem_name, unit_price_lkr) VALUES (?, ?, ?, ?)";

            for (CartItem cartItem : cart.getCartItems()) {
                Long finalId = (cartItem.getListingId() != null) ? cartItem.getListingId() : cartItem.getJewelleryId();
                jdbcTemplate.update(sql,
                        savedOrder.getOrderId(),
                        finalId,
                        cartItem.getGemName(),
                        cartItem.getUnitPriceLkr()
                );
            }
        }

        // 7. CLEANUP: Clear Items and Seal Cart
        // We DON'T delete the cart record here because the Order might reference it via FK.
        // We just empty it so it's no longer "active" for the user.
        try {
            // Remove items from the cart_item table using direct SQL
            // (prevents Hibernate from complaining about deleted child entities)
            jdbcTemplate.update("DELETE FROM cart_item WHERE cart_id = ?", cart.getCartId());

            // Update Cart state so it doesn't appear in the "Active Cart" queries
            cart.setCustomer(customer);
            cart.setStatus("CHECKED_OUT");
            cartRepository.save(cart);

        } catch (Exception e) {
            // Log but don't fail the whole order if cleanup has a minor DB glitch
            System.err.println("Non-critical error clearing cart items: " + e.getMessage());
        }

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String upperStatus = status.toUpperCase();
        order.setOrderStatus(upperStatus);

        if ("PACKED".equals(upperStatus)) {
            order.setPackedAt(LocalDateTime.now());
        } else if ("DELIVERED".equals(upperStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }
}