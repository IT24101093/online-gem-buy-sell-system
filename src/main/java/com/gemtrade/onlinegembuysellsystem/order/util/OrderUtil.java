package com.gemtrade.onlinegembuysellsystem.order.util;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.CourierShippingConfig;
import com.gemtrade.onlinegembuysellsystem.order.entity.InsuranceRiskConfig;
import com.gemtrade.onlinegembuysellsystem.order.repository.CourierShippingConfigRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.InsuranceRiskConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Optional;

public class OrderUtil {


    private static InventoryItemService inventoryItemService;


    private static CourierShippingConfigRepository courierRepository;

    private static InsuranceRiskConfigRepository insuranceRepository;
    //calculateInsuranceFEE
    //calculatetotal
    public static void calculateOrder(OrderDTO orderDTO) {
        Optional<InventoryItem> inventoryItem = inventoryItemService.getInventoryItemByInventoryId(orderDTO.getInventoryId());
        BigDecimal weightCt = new BigDecimal("0");
        String gemType = null;
        /// ////////////////////////////////////////////////ADD price from market place //////////
        BigDecimal estimatedPrice = new BigDecimal(20); ////need to get this price by passing inventoryID
        if (inventoryItem.isPresent()) {
            weightCt = inventoryItem.get().getWeightCt();
            gemType = inventoryItem.get().getGemType();

        }
        calculateDeliveryFee(orderDTO, weightCt);
        calculateInsuranceFee(orderDTO, estimatedPrice, gemType);
        calculateTotal(orderDTO);
    }

    private static void calculateDeliveryFee(OrderDTO orderDTO, BigDecimal weightCt) {
        // Look up configuration from DB based on Region (e.g., 'INTERNATIONAL')
        Optional<CourierShippingConfig> config = courierRepository.findByRegionName("INTERNATIONAL");

        if (config.isPresent()) {
            BigDecimal base = config.get().getBaseCourierFee();
            BigDecimal markup = config.get().getWeightUnitMarkup();

            // Formula: Base Fee + (Weight * Markup)
            BigDecimal finalFee = base.add(weightCt.multiply(markup));
            orderDTO.setDeliveryFee(finalFee);
        } else {
            orderDTO.setDeliveryFee(new BigDecimal("5000")); // Fallback
        }
    }

    private static void calculateInsuranceFee(OrderDTO orderDTO, BigDecimal estimatedPrice, String gemType) {

        // Look up Risk Multiplier from DB based on Gem Type (e.g., 'DIAMOND')
        Optional<InsuranceRiskConfig> config = insuranceRepository.findByGemType(gemType);

        if (config.isPresent()) {
            BigDecimal multiplier = config.get().getRiskMultiplier();

            // Formula: Market Value * Risk Multiplier (e.g., 0.02 for 2%)
            BigDecimal finalInsurance = estimatedPrice.multiply(multiplier);
            orderDTO.setInsuranceFee(finalInsurance);
        } else {
            orderDTO.setInsuranceFee(estimatedPrice.multiply(new BigDecimal("0.02"))); // Fallback 2%
        }
    }

    private static void calculateTotal(OrderDTO orderDTO) {

        // value of gem + deliveryfee +insuranceFee

        BigDecimal estimatedPrice = new BigDecimal(20); ////need to get this price by passing inventoryID
        BigDecimal insuranceFee = orderDTO.getInsuranceFee() != null ? orderDTO.getInsuranceFee() : BigDecimal.ZERO;
        BigDecimal deliveryFee = orderDTO.getDeliveryFee() != null ? orderDTO.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal total = insuranceFee.add(estimatedPrice).add(deliveryFee);
        orderDTO.setTotalAmountLkr(total);
    }
}
