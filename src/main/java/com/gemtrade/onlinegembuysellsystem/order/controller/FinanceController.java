package com.gemtrade.onlinegembuysellsystem.order.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*") // Allows your frontend to connect
public class FinanceController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * This endpoint provides the "Purchasing Liabilities" and "Asset"
     * data for the Admin Analytics dashboard.
     */
    @GetMapping("/summary")
    public Map<String, Object> getFinanceSummary() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. Calculate Total Liabilities (Confirmed but unpaid orders)
            // Matches the amount_lkr column in your corporate_liabilities table
            String liabilitySql = "SELECT SUM(amount_lkr) FROM corporate_liabilities";
            Double totalLiabilities = jdbcTemplate.queryForObject(liabilitySql, Double.class);

            // 2. Calculate Total Asset Value (Optional: Sum from corporate_assets)
            String assetSql = "SELECT SUM(value_lkr) FROM corporate_assets";
            Double totalAssets = jdbcTemplate.queryForObject(assetSql, Double.class);

            response.put("totalPending", totalLiabilities != null ? totalLiabilities : 0.0);
            response.put("totalAssetsValue", totalAssets != null ? totalAssets : 0.0);
            response.put("status", "success");

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            response.put("totalPending", 0.0);
        }

        return response;
    }
}