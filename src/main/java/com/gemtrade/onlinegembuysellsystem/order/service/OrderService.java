package com.gemtrade.onlinegembuysellsystem.order.service;

import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.dto.CustomerDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderRequest;
import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;
import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.order.entity.Order;
import com.gemtrade.onlinegembuysellsystem.order.repository.CustomerRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.DeliveryServiceRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.OrderRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeliveryServiceRepository deliveryServiceRepository;

    public Order createOrderWithCustomerAndDelivery(OrderDTO dto, CustomerDTO customerDTO) {
        // 1️⃣ Save customer
        Customer customer = new Customer();
        BeanUtils.copyProperties(customerDTO, customer);
        customer = customerRepository.save(customer);

        // 2️⃣ Get delivery service from local DB
        DeliveryService deliveryService = null;
        if (dto.getDeliveryServiceId() != null) {
            deliveryService = deliveryServiceRepository.findById(dto.getDeliveryServiceId())
                    .orElseThrow(() -> new RuntimeException("Delivery service not found"));
        }

        // 3️⃣ Create order
        Order order = new Order();
        order.setCustomer(customer);
        order.setDeliveryService(deliveryService);
        order.setDeliveryFee(dto.getDeliveryFee());
        order.setInsuranceFee(dto.getInsuranceFee());
        order.setOrderStatus("CONFIRMED");  // status could be CONFIRMED, CANCELLED, ONHOLD
        order.setTotalAmountLkr(dto.getDeliveryFee().add(dto.getInsuranceFee())); // calculate total automatically
        return orderRepository.save(order);
    }
}

