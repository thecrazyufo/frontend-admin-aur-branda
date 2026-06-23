package com.datamigratepro.controller;

import com.datamigratepro.entity.BrandConfig;
import com.datamigratepro.service.BrandConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandConfigController {

    @Autowired
    private BrandConfigService brandConfigService;

    @GetMapping
    public ResponseEntity<List<BrandConfig>> getActiveBrands() {
        return ResponseEntity.ok(brandConfigService.getAllActiveBrands());
    }
}
