package com.gemtrade.onlinegembuysellsystem.order.util;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;

import java.math.BigDecimal;
import java.util.Optional;

public class OrderUtil {


    private static InventoryItemService inventoryItemService;
    //calculateInsuranceFEE
    //calculatetotal
    public static void calculateOrder(OrderDTO orderDTO) {
        Optional<InventoryItem> inventoryItem = inventoryItemService.getInventoryItemByInventoryId(orderDTO.getInventoryId());
        BigDecimal weightCt = new BigDecimal("0");
        if (inventoryItem.isPresent()) {
            weightCt = inventoryItem.get().getWeightCt();
        }
        calculateDeliveryFee(orderDTO, weightCt);
        calculateInsuranceFee(orderDTO, weightCt);
        calculateTotal(orderDTO);
    }

    private static void calculateDeliveryFee(OrderDTO orderDTO, BigDecimal weightCt) {

        orderDTO.setDeliveryFee(new BigDecimal(20));
    }

    private static void calculateInsuranceFee(OrderDTO orderDTO, BigDecimal weightCt) {

        orderDTO.setInsuranceFee(new BigDecimal(10));
    }

    private static void calculateTotal(OrderDTO orderDTO) {

        // value of gem + deliveryfee +insuranceFee

        BigDecimal estimatedPrice = new BigDecimal(20); ////need to get this price by passing inventoryID
        BigDecimal insuranceFee = orderDTO.getInsuranceFee();
        BigDecimal deliveryFee = orderDTO.getDeliveryFee();
        BigDecimal total = insuranceFee.add(estimatedPrice).add(deliveryFee);
        orderDTO.setTotalAmountLkr(total);
    }
}
