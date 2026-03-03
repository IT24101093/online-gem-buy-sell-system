package com.gemtrade.onlinegembuysellsystem.inventory.service;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SellerRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.GemCertificate;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.InventoryItem;
import com.gemtrade.onlinegembuysellsystem.inventory.entity.Seller;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.GemCertificateRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.InventoryItemRepository;
import com.gemtrade.onlinegembuysellsystem.inventory.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertifiedGemService {

    private final SellerRepository sellerRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final GemCertificateRepository gemCertificateRepository;

    @Transactional
    public CertifiedGemResponseDto addCertifiedGem(CertifiedGemRequestDto requestDto) {
        Seller seller = getOrCreateSeller(requestDto.getSeller());

        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setInventoryCode(generateInventoryCode());
        inventoryItem.setSource(InventoryItem.Source.CERTIFIED);
        inventoryItem.setGemType(requestDto.getGemType());
        inventoryItem.setCategory(requestDto.getCategory());
        inventoryItem.setWeightCt(requestDto.getWeightCt());
        inventoryItem.setEstimatedValueLkr(requestDto.getEstimatedValueLkr());
        inventoryItem.setDescription(requestDto.getDescription());
        inventoryItem.setDescriptionMode(
                requestDto.getDescription() != null && !requestDto.getDescription().isBlank()
                        ? InventoryItem.DescriptionMode.MANUAL
                        : null
        );
        inventoryItem.setSeller(seller);
        inventoryItem.setStatus(InventoryItem.Status.IN_STOCK);

        InventoryItem savedItem = inventoryItemRepository.save(inventoryItem);

        GemCertificate gemCertificate = new GemCertificate();
        gemCertificate.setInventoryItem(savedItem);
        gemCertificate.setCertificateNo(requestDto.getCertificateNo());
        gemCertificate.setLabName(requestDto.getLabName());
        gemCertificate.setIssueDate(requestDto.getIssueDate());
        gemCertificate.setReportUrl(requestDto.getReportUrl());

        gemCertificateRepository.save(gemCertificate);

        return new CertifiedGemResponseDto(
                savedItem.getInventoryItemId(),
                savedItem.getInventoryCode(),
                savedItem.getGemType(),
                savedItem.getSource().name(),
                seller.getName(),
                gemCertificate.getCertificateNo(),
                "Certified gem added successfully"
        );
    }

    private Seller getOrCreateSeller(SellerRequestDto sellerDto) {
        Optional<Seller> existingSeller = sellerRepository.findByNic(sellerDto.getNic());

        if (existingSeller.isPresent()) {
            return existingSeller.get();
        }

        Seller seller = new Seller();
        seller.setName(sellerDto.getName());
        seller.setNic(sellerDto.getNic());
        seller.setPhone(sellerDto.getPhone());

        return sellerRepository.save(seller);
    }

    private String generateInventoryCode() {
        long count = inventoryItemRepository.count() + 1;
        return String.format("INV%05d", count);
    }
}