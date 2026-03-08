package com.gemtrade.onlinegembuysellsystem.inventory.controller;

import com.gemtrade.onlinegembuysellsystem.inventory.dto.*;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisEngineService;
import com.gemtrade.onlinegembuysellsystem.inventory.service.SmartAnalysisSaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SmartAnalysisControllerV2 {

    private final SmartAnalysisEngineService engine;
    private final SmartAnalysisSaveService saveService;

    @PostMapping("/run")
    public ResponseEntity<SmartAnalysisRunResponseDto> run(@RequestBody SmartAnalysisRunRequestDto dto) {
        return ResponseEntity.ok(engine.run(dto));
    }

    @PostMapping("/save")
    public ResponseEntity<SmartAnalysisSaveResponseDto> save(@RequestBody SmartAnalysisSaveRequestDto dto) {
        return ResponseEntity.ok(saveService.save(dto));
    }
}