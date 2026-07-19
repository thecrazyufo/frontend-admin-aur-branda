package com.datamigratepro.controller;

import com.datamigratepro.entity.BrandConfig;
import com.datamigratepro.service.BrandConfigService;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.datamigratepro.config.UserCredentials;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/brands")
public class BrandConfigController {

    @Autowired
    private BrandConfigService brandConfigService;

    @GetMapping
    public ResponseEntity<List<BrandConfig>> getActiveBrands() {
        List<BrandConfig> all = brandConfigService.getAllActiveBrands();
        UserCredentials user = SecurityUtils.getCurrentUser();
        if (user != null && user.role() != null) {
            String role = user.role();
            if (!"SUPER_ADMIN".equalsIgnoreCase(role) && !"OWNER".equalsIgnoreCase(role)) {
                String assignedBrand = user.brandId();
                if (assignedBrand != null && !"all".equalsIgnoreCase(assignedBrand)) {
                    List<BrandConfig> filtered = all.stream()
                            .filter(b -> b.getId() != null && b.getId().equalsIgnoreCase(assignedBrand))
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(filtered);
                }
            }
        }
        return ResponseEntity.ok(all);
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
