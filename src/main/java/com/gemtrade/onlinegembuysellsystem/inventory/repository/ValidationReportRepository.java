package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.ValidationReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValidationReportRepository extends JpaRepository<ValidationReport, Long> {
}