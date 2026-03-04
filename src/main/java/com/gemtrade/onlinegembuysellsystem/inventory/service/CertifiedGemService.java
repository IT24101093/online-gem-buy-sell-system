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
import com.gemtrade.onlinegembuysellsystem.inventory.dto.InventoryItemResponseDto;
import java.util.List;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertifiedGemService {

    private final SellerRepository sellerRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final GemCertificateRepository gemCertificateRepository;

    @Transactional
    public CertifiedGemResponseDto addCertifiedGem(CertifiedGemRequestDto requestDto) {
        if (requestDto.getGemType() == null || requestDto.getGemType().isBlank()) {
            throw new RuntimeException("Gem type is required");
        }

        if (requestDto.getCertificateNo() == null || requestDto.getCertificateNo().isBlank()) {
            throw new RuntimeException("Certificate number is required");
        }

        if (requestDto.getSeller() == null) {
            throw new RuntimeException("Seller details are required");
        }

        if (requestDto.getSeller().getNic() == null || requestDto.getSeller().getNic().isBlank()) {
            throw new RuntimeException("Seller NIC is required");
        }//checking any missing valueus before store in database
        if (gemCertificateRepository.findByCertificateNo(requestDto.getCertificateNo()).isPresent()) {
            throw new IllegalArgumentException("Certificate number already exists");//check duplicate in Certified gem db
        }
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
    // Inventory read/list service method: fetch all saved inventory items and map them to response DTOs
    public List<InventoryItemResponseDto> getAllInventoryItems() {
        return inventoryItemRepository.findAll()
                .stream()
                .map(item -> new InventoryItemResponseDto(
                        item.getInventoryItemId(),
                        item.getInventoryCode(),
                        item.getSource() != null ? item.getSource().name() : null,
                        item.getGemType(),
                        item.getCategory(),
                        item.getWeightCt(),
                        item.getEstimatedValueLkr(),
                        item.getDescription(),
                        item.getStatus() != null ? item.getStatus().name() : null,
                        item.getSeller() != null ? item.getSeller().getName() : null
                ))
                .toList();
    }
    // Inventory read/list service: get all items, or filter items by source (CERTIFIED / ANALYSIS)
    public List<InventoryItemResponseDto> getInventoryItemsBySource(String source) {
        List<InventoryItem> items;

        if (source == null || source.isBlank()) {
            items = inventoryItemRepository.findAll();
        } else {
            InventoryItem.Source enumSource = InventoryItem.Source.valueOf(source.toUpperCase());
            items = inventoryItemRepository.findBySource(enumSource);
        }

        return items.stream()
                .map(item -> new InventoryItemResponseDto(
                        item.getInventoryItemId(),
                        item.getInventoryCode(),
                        item.getSource() != null ? item.getSource().name() : null,
                        item.getGemType(),
                        item.getCategory(),
                        item.getWeightCt(),
                        item.getEstimatedValueLkr(),
                        item.getDescription(),
                        item.getStatus() != null ? item.getStatus().name() : null,
                        item.getSeller() != null ? item.getSeller().getName() : null
                ))
                .toList();
    }


}