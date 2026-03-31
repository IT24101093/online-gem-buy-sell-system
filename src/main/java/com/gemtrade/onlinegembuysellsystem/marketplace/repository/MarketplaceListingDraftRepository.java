package com.gemtrade.onlinegembuysellsystem.marketplace.repository;

import com.gemtrade.onlinegembuysellsystem.marketplace.entity.MarketplaceListingDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceListingDraftRepository extends JpaRepository<MarketplaceListingDraft, Long> {
    // Change parameter from DraftStatus to String
    List<MarketplaceListingDraft> findByStatus(String status);
}
