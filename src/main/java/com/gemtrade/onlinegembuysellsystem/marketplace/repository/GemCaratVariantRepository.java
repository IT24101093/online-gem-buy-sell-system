package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.marketplace.entity.GemCaratVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GemCaratVariantRepository extends JpaRepository<GemCaratVariant, Long> {

    List<GemCaratVariant> findByListingListingIdOrderByCaratValueAsc(Long listingId);

    void deleteByListingListingId(Long listingId);
}
