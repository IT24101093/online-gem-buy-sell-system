package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisRequestDto;
import com.gemtrade.onlinegembuysellsystem.inventory.dto.SmartAnalysisResponseDto;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmartAnalysisController {

    private final SmartAnalysisService smartAnalysisService;

    @PostMapping
    public ResponseEntity<SmartAnalysisResponseDto> addAnalysisGem(@RequestBody SmartAnalysisRequestDto dto) {
        SmartAnalysisResponseDto response = smartAnalysisService.addAnalysisGem(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}