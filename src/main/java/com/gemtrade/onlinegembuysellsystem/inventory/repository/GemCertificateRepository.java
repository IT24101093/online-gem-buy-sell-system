package com.gemtrade.onlinegembuysellsystem.inventory.repository;

import com.gemtrade.onlinegembuysellsystem.inventory.entity.GemCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GemCertificateRepository extends JpaRepository<GemCertificate, Long> {
    Optional<GemCertificate> findByCertificateNo(String certificateNo);
}