package com.gemtrade.onlinegembuysellsystem.order.util;

import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;

import java.math.BigDecimal;

public class OrderUtil {

    //calculateInsuranceFEE
    //calculatetotal
    public static void calculateOrder(OrderDTO orderDTO) {
        calculateDeliveryFee(orderDTO);
        calculateInsuranceFee(orderDTO);
        calculateTotal(orderDTO);
    }

    private static void calculateDeliveryFee(OrderDTO orderDTO) {
        orderDTO.setDeliveryFee(new BigDecimal(20));
    }

    private static void calculateInsuranceFee(OrderDTO orderDTO) {
        orderDTO.setInsuranceFee(new BigDecimal(10));
    }

    private static void calculateTotal(OrderDTO orderDTO) {

        // value of gem + deliveryfee +insuranceFee

        BigDecimal estimatedPrice = new BigDecimal(20); ////need to get this price by passing inventoryID
        BigDecimal insuranceFee = orderDTO.getInsuranceFee();
        BigDecimal deliveryFee = orderDTO.getDeliveryFee();
        BigDecimal total = insuranceFee.add(estimatedPrice).add(deliveryFee);
        orderDTO.setTotal(total);
    }
}
