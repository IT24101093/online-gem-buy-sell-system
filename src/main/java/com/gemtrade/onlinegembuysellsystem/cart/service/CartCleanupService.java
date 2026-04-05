package com.gemtrade.onlinegembuysellsystem.cart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CartCleanupService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // This tells Spring Boot to run this method automatically every 24 hours!
    @Scheduled(fixedRate = 86400000) // 86,400,000 milliseconds = 24 hours
    public void deleteAbandonedCarts() {
        System.out.println("Running daily cleanup of abandoned carts...");

        try {
            // Deletes any active cart that was created more than 24 hours ago
            int deletedCount = jdbcTemplate.update(
                    "DELETE FROM cart WHERE status = 'active' AND created_at < ?",
                    LocalDateTime.now().minusDays(1)
            );
            System.out.println("Cleanup finished. Deleted " + deletedCount + " abandoned carts.");
        } catch (Exception e) {
            System.err.println("Error cleaning up carts: " + e.getMessage());
        }
    }
}