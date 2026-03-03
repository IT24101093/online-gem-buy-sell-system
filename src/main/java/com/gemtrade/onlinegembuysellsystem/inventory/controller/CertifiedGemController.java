package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.CertifiedGemResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.service.CertifiedGemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/certified")
@RequiredArgsConstructor
@CrossOrigin
public class CertifiedGemController {

    private final CertifiedGemService certifiedGemService;

    @PostMapping
    public ResponseEntity<CertifiedGemResponseDto> addCertifiedGem(
            @RequestBody CertifiedGemRequestDto requestDto
    ) {
        CertifiedGemResponseDto response = certifiedGemService.addCertifiedGem(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}