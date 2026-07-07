package com.datamigratepro.controller;

import com.datamigratepro.entity.SourceFormat;
import com.datamigratepro.entity.TargetFormat;
import com.datamigratepro.entity.SupportedClient;
import com.datamigratepro.entity.KeyFeature;
import com.datamigratepro.repository.SourceFormatRepository;
import com.datamigratepro.repository.TargetFormatRepository;
import com.datamigratepro.repository.SupportedClientRepository;
import com.datamigratepro.repository.KeyFeatureRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/registry")
public class GlobalRegistryController {

    @Autowired
    private SourceFormatRepository sourceFormatRepository;

    @Autowired
    private TargetFormatRepository targetFormatRepository;

    @Autowired
    private SupportedClientRepository supportedClientRepository;

    @Autowired
    private KeyFeatureRepository keyFeatureRepository;

    // ─── SOURCE FORMATS ──────────────────────────────────────────────────────

    @GetMapping("/source-formats")
    public ResponseEntity<List<SourceFormat>> getSourceFormats(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(sourceFormatRepository.findBySiteId(siteId));
    }

    @PostMapping("/source-formats")
    public ResponseEntity<SourceFormat> createSourceFormat(@RequestBody SourceFormat item) {
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(item.getSiteId());
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(sourceFormatRepository.save(item));
    }

    @PutMapping("/source-formats/{id}")
    public ResponseEntity<SourceFormat> updateSourceFormat(@PathVariable String id, @RequestBody SourceFormat item) {
        Optional<SourceFormat> existing = sourceFormatRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            item.setSiteId(existing.get().getSiteId());
        }
        SecurityUtils.checkAccess(item.getSiteId());
        item.setId(id);
        return ResponseEntity.ok(sourceFormatRepository.save(item));
    }

    @DeleteMapping("/source-formats/{id}")
    public ResponseEntity<Void> deleteSourceFormat(@PathVariable String id) {
        Optional<SourceFormat> existing = sourceFormatRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        sourceFormatRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── TARGET FORMATS ──────────────────────────────────────────────────────

    @GetMapping("/target-formats")
    public ResponseEntity<List<TargetFormat>> getTargetFormats(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(targetFormatRepository.findBySiteId(siteId));
    }

    @PostMapping("/target-formats")
    public ResponseEntity<TargetFormat> createTargetFormat(@RequestBody TargetFormat item) {
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(item.getSiteId());
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(targetFormatRepository.save(item));
    }

    @PutMapping("/target-formats/{id}")
    public ResponseEntity<TargetFormat> updateTargetFormat(@PathVariable String id, @RequestBody TargetFormat item) {
        Optional<TargetFormat> existing = targetFormatRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            item.setSiteId(existing.get().getSiteId());
        }
        SecurityUtils.checkAccess(item.getSiteId());
        item.setId(id);
        return ResponseEntity.ok(targetFormatRepository.save(item));
    }

    @DeleteMapping("/target-formats/{id}")
    public ResponseEntity<Void> deleteTargetFormat(@PathVariable String id) {
        Optional<TargetFormat> existing = targetFormatRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        targetFormatRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── SUPPORTED CLIENTS ───────────────────────────────────────────────────

    @GetMapping("/supported-clients")
    public ResponseEntity<List<SupportedClient>> getSupportedClients(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(supportedClientRepository.findBySiteId(siteId));
    }

    @PostMapping("/supported-clients")
    public ResponseEntity<SupportedClient> createSupportedClient(@RequestBody SupportedClient item) {
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(item.getSiteId());
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(supportedClientRepository.save(item));
    }

    @PutMapping("/supported-clients/{id}")
    public ResponseEntity<SupportedClient> updateSupportedClient(@PathVariable String id, @RequestBody SupportedClient item) {
        Optional<SupportedClient> existing = supportedClientRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            item.setSiteId(existing.get().getSiteId());
        }
        SecurityUtils.checkAccess(item.getSiteId());
        item.setId(id);
        return ResponseEntity.ok(supportedClientRepository.save(item));
    }

    @DeleteMapping("/supported-clients/{id}")
    public ResponseEntity<Void> deleteSupportedClient(@PathVariable String id) {
        Optional<SupportedClient> existing = supportedClientRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        supportedClientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── KEY FEATURES ────────────────────────────────────────────────────────

    @GetMapping("/key-features")
    public ResponseEntity<List<KeyFeature>> getKeyFeatures(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(keyFeatureRepository.findBySiteId(siteId));
    }

    @PostMapping("/key-features")
    public ResponseEntity<KeyFeature> createKeyFeature(@RequestBody KeyFeature item) {
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(item.getSiteId());
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(keyFeatureRepository.save(item));
    }

    @PutMapping("/key-features/{id}")
    public ResponseEntity<KeyFeature> updateKeyFeature(@PathVariable String id, @RequestBody KeyFeature item) {
        Optional<KeyFeature> existing = keyFeatureRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (item.getSiteId() == null || item.getSiteId().isBlank()) {
            item.setSiteId(existing.get().getSiteId());
        }
        SecurityUtils.checkAccess(item.getSiteId());
        item.setId(id);
        return ResponseEntity.ok(keyFeatureRepository.save(item));
    }

    @DeleteMapping("/key-features/{id}")
    public ResponseEntity<Void> deleteKeyFeature(@PathVariable String id) {
        Optional<KeyFeature> existing = keyFeatureRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SecurityUtils.checkAccess(existing.get().getSiteId());
        keyFeatureRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
