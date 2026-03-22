package com.gemtrade.onlinegembuysellsystem.order.controller;

import com.gemtrade.onlinegembuysellsystem.order.dto.CustomerDTO;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.Order;
import com.gemtrade.onlinegembuysellsystem.order.repository.OrderRepository;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderRequest;
import com.gemtrade.onlinegembuysellsystem.order.service.OrderService;
import com.gemtrade.onlinegembuysellsystem.order.util.OrderUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.OrderUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    // MODIFICATION: Courier & Insurance Estimator
    // Call this from JS when user selects "International"
//    @GetMapping("/courier/estimate")
//    public ResponseEntity<Map<String, Object>> getCourierEstimate(@RequestParam Double gemValue) {
//        double baseShipping = 7500.00; // Fixed international cost
//        double insurancePremium = gemValue * 0.02; // 2% Industry Standard Insurance
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("courier", "DHL Express Global");
//        response.put("shippingFee", baseShipping);
//        response.put("insuranceFee", insurancePremium);
//        response.put("totalDelivery", baseShipping + insurancePremium);
//        response.put("agent", "Ceylon Gem Insurance Ltd");
//
//        return ResponseEntity.ok(response);
//    }
//
//    @PostMapping("/negotiate")
//    public ResponseEntity<Map<String, Object>> negotiatePrice(@RequestBody Map<String, Object> payload) {
//        double currentPrice = Double.parseDouble(payload.get("price").toString());
//        double discountedPrice = currentPrice * 0.75;
//        Map<String, Object> response = new HashMap<>();
//        response.put("message", "Negotiation successful! 25% discount applied.");
//        response.put("newPrice", discountedPrice);
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/stats")
//    public ResponseEntity<Map<String, Long>> getDashboardStats() {
//        Map<String, Long> stats = new HashMap<>();
//        stats.put("total", orderRepository.count());
//        stats.put("processing", orderRepository.countByStatus("PROCESSING"));
//        stats.put("packed", orderRepository.countByStatus("PACKED"));
//        stats.put("delivered", orderRepository.countByStatus("DELIVERED"));
//        return ResponseEntity.ok(stats);
//    }

    @PostMapping("/viewTotal")
    public ResponseEntity<OrderDTO> viewTotal(@RequestBody OrderRequest req) {
        //customerdetails, delivery details,
        OrderDTO orderDTO = createOrderDTO(req.getOrderDTO());
        return ResponseEntity.ok(orderDTO);
    }

//    @PostMapping("/save")
//    public ResponseEntity<Order> saveNewOrder(@RequestBody OrderRequest req) {
//        //customerdetails, delivery details,
//        //adopt request objecy to make Cutomerdto & OrderDTO
//        OrderDTO orderDTO = createOrderDTO(req.getOrderDTO());
//        //CustomerDTO customerDTO = adoptCutomerDTO(req.getCustomerDetails());
//       // orderService.createOrderWithCustomerAndDelivery(orderDTO, req.getCustomerDetails());
//        return ResponseEntity.ok(orderService.saveOrder(req));
//    }

    private OrderDTO createOrderDTO(OrderDTO orderDTO) {

        OrderUtil.calculateOrder(orderDTO);
        return orderDTO;

    }


}