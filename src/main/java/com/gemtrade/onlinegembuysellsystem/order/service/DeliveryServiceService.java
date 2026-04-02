package com.gemtrade.onlinegembuysellsystem.order.service;

import com.gemtrade.onlinegembuysellsystem.order.dto.DeliveryServiceDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.DeliveryService;
import com.gemtrade.onlinegembuysellsystem.order.repository.DeliveryServiceRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryServiceService {
    @Autowired
    private DeliveryServiceRepository repository;

    public DeliveryService saveService(DeliveryServiceDTO dto) {
        DeliveryService service = new DeliveryService();
        BeanUtils.copyProperties(dto, service);
        return repository.save(service);
    }



    public List<DeliveryServiceDTO> getAllDeliveryServices() {
        List<DeliveryService> services = repository.findByStatus("active");

        return services.stream().map(service -> {
            DeliveryServiceDTO dto = new DeliveryServiceDTO();
            BeanUtils.copyProperties(service, dto);
            return dto;
        }).toList();
    }
}