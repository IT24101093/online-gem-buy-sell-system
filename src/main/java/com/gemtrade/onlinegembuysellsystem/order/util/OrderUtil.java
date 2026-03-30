package com.gemtrade.onlinegembuysellsystem.order.util;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.service.InventoryItemService;
import com.gemtrade.onlinegembuysellsystem.order.dto.OrderDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.CourierShippingConfig;
import com.gemtrade.onlinegembuysellsystem.order.entity.InsuranceRiskConfig;
import com.gemtrade.onlinegembuysellsystem.order.repository.CourierShippingConfigRepository;
import com.gemtrade.onlinegembuysellsystem.order.repository.InsuranceRiskConfigRepository;

import java.math.BigDecimal;
import java.util.Optional;

public class OrderUtil {

    public static void calculateOrder(OrderDTO orderDTO,
                                      InventoryItemService inventoryItemService,
                                      CourierShippingConfigRepository courierRepository,
                                      InsuranceRiskConfigRepository insuranceRepository) {

        Optional<InventoryItem> inventoryItem = inventoryItemService.getInventoryItemByInventoryId(orderDTO.getInventoryId());

        if (inventoryItem.isPresent()) {
            InventoryItem item = inventoryItem.get();
            BigDecimal gemPrice = item.getEstimatedValueLkr(); // Get real price from DB
            BigDecimal weight = item.getWeightCt();
            String type = item.getGemType();

            // 1. Calculate Fees
            calculateDeliveryFee(orderDTO, weight, courierRepository);
            calculateInsuranceFee(orderDTO, gemPrice, type, insuranceRepository);

            // 2. Calculate Final Total (Price + Delivery + Insurance)
            BigDecimal total = gemPrice
                    .add(orderDTO.getDeliveryFee())
                    .add(orderDTO.getInsuranceFee());

            orderDTO.setTotalAmountLkr(total);

            // 3. Optional: Set names for the UI
            orderDTO.setCourierName("DHL Global Express");
            orderDTO.setInsuranceProvider("Ceylon Gem Insurance");
        } else {
            // Handle case where inventoryId is wrong
            orderDTO.setTotalAmountLkr(BigDecimal.ZERO);
        }
    }

    private static void calculateDeliveryFee(OrderDTO orderDTO, BigDecimal weightCt, CourierShippingConfigRepository courierRepository) {
        Optional<CourierShippingConfig> config = courierRepository.findByRegionName("INTERNATIONAL");

        if (config.isPresent()) {
            BigDecimal base = config.get().getBaseCourierFee();
            BigDecimal markup = config.get().getWeightUnitMarkup();
            BigDecimal finalFee = base.add(weightCt.multiply(markup));
            orderDTO.setDeliveryFee(finalFee);
        } else {
            orderDTO.setDeliveryFee(new BigDecimal("5000"));
        }
    }

    private static void calculateInsuranceFee(OrderDTO orderDTO, BigDecimal estimatedPrice, String gemType, InsuranceRiskConfigRepository insuranceRepository) {
        if (gemType == null) {
            orderDTO.setInsuranceFee(BigDecimal.ZERO);
            return;
        }

        Optional<InsuranceRiskConfig> config = insuranceRepository.findByGemType(gemType);
        if (config.isPresent()) {
            BigDecimal multiplier = config.get().getRiskMultiplier();
            orderDTO.setInsuranceFee(estimatedPrice.multiply(multiplier));
        } else {
            orderDTO.setInsuranceFee(estimatedPrice.multiply(new BigDecimal("0.02")));
        }
    }

    private static void calculateTotal(OrderDTO orderDTO, BigDecimal estimatedPrice) {
        BigDecimal insuranceFee = orderDTO.getInsuranceFee() != null ? orderDTO.getInsuranceFee() : BigDecimal.ZERO;
        BigDecimal deliveryFee = orderDTO.getDeliveryFee() != null ? orderDTO.getDeliveryFee() : BigDecimal.ZERO;
        orderDTO.setTotalAmountLkr(insuranceFee.add(estimatedPrice).add(deliveryFee));
    }
}