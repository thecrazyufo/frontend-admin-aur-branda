package com.datamigratepro.controller;

import com.datamigratepro.entity.SiteSetting;
import com.datamigratepro.repository.SiteSettingRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingController {

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    // ✅ PUBLIC GET ENDPOINT — full settings
    @GetMapping
    public ResponseEntity<SiteSetting> getSettings(
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        return siteSettingRepository.findBySiteId(siteId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔐 ADMIN-ONLY FULL WRITE ENDPOINT
    @PutMapping
    public ResponseEntity<SiteSetting> updateSettings(@RequestBody SiteSetting settings) {
        if (settings.getSiteId() == null || settings.getSiteId().isBlank()) {
            throw new IllegalArgumentException("Site setting siteId is required");
        }
        
        SecurityUtils.checkAccess(settings.getSiteId());

        Optional<SiteSetting> existing = siteSettingRepository.findBySiteId(settings.getSiteId());
        if (existing.isPresent()) {
            settings.setId(existing.get().getId());
        } else {
            if (settings.getId() == null || settings.getId().isBlank()) {
                settings.setId(UUID.randomUUID().toString());
            }
        }

        return ResponseEntity.ok(siteSettingRepository.save(settings));
    }

    // 🔐 ADMIN-ONLY PARTIAL UPDATE ENDPOINT
    // Allows Brand Managers to update only specific sections without overwriting others
    @PatchMapping
    public ResponseEntity<SiteSetting> patchSettings(
            @RequestParam(required = true) String siteId,
            @RequestBody Map<String, Object> updates) {
        
        SecurityUtils.checkAccess(siteId);

        Optional<SiteSetting> existingOpt = siteSettingRepository.findBySiteId(siteId);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SiteSetting existing = existingOpt.get();

        // Apply partial updates using reflection-free approach for known fields
        if (updates.containsKey("name")) existing.setName((String) updates.get("name"));
        if (updates.containsKey("tagline")) existing.setTagline((String) updates.get("tagline"));
        if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
        if (updates.containsKey("url")) existing.setUrl((String) updates.get("url"));
        if (updates.containsKey("email")) existing.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone")) existing.setPhone((String) updates.get("phone"));
        if (updates.containsKey("address")) existing.setAddress((String) updates.get("address"));

        // For JSONB fields, Jackson will handle deserialization via the full PUT endpoint.
        // The PATCH endpoint supports simple scalar fields for lightweight partial updates.
        // For complex nested JSON updates (theme, navigation, hero, etc.), use the full PUT endpoint.

        return ResponseEntity.ok(siteSettingRepository.save(existing));
    }
}
