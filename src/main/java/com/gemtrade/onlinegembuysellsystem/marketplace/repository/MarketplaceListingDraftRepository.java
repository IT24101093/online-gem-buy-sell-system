package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.marketplace.entity.MarketplaceListingDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceListingDraftRepository extends JpaRepository<MarketplaceListingDraft, Long> {
}