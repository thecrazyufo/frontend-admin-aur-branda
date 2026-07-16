package com.datamigratepro.controller;

import com.datamigratepro.entity.BrandConfig;
import com.datamigratepro.service.BrandConfigService;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/{id}")
    public ResponseEntity<BrandConfig> updateBrandConfig(
            @PathVariable String id, 
            @RequestBody BrandConfig config) {
        
        SecurityUtils.checkAccess(id);
        
        BrandConfig existing = brandConfigService.getBrandConfig(id);
        if (existing == null) {
            existing = brandConfigService.getBrandConfigFromDb(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
        }
        
        if (config.getLayoutTemplate() != null) {
            existing.setLayoutTemplate(config.getLayoutTemplate());
        }
        if (config.getLogoUrl() != null) {
            existing.setLogoUrl(config.getLogoUrl());
        }
        if (config.getThemeColors() != null) {
            existing.setThemeColors(config.getThemeColors());
        }
        
        BrandConfig saved = brandConfigService.saveBrandConfig(existing);
        return ResponseEntity.ok(saved);
    }
}
