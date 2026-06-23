package com.datamigratepro.controller;

import com.datamigratepro.entity.License;
import com.datamigratepro.entity.LicenseActivation;
import com.datamigratepro.entity.LicenseKey;
import com.datamigratepro.entity.LicenseStatus;
import com.datamigratepro.repository.ActivationRepository;
import com.datamigratepro.repository.LicenseActivationRepository;
import com.datamigratepro.repository.LicenseKeyRepository;
import com.datamigratepro.repository.LicenseRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LicenseController {

    @Autowired
    private LicenseKeyRepository licenseKeyRepository;

    @Autowired
    private LicenseActivationRepository licenseActivationRepository;

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private ActivationRepository activationRepository;

    // ─── PUBLIC CLIENT API
    // ────────────────────────────────────────────────────────

    @PostMapping("/licenses/validate")
    public ResponseEntity<Map<String, Object>> validateLicense(@RequestBody Map<String, String> request) {
        String key = request.get("activationKey");
        String orderId = request.get("orderId");
        String fingerprint = request.get("hardwareFingerprint");
        String deviceName = request.getOrDefault("deviceName", "Desktop App");

        if (key == null || key.trim().isEmpty() || orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "Activation Key and Order ID are required"));
        }

        if (fingerprint == null || fingerprint.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "Hardware fingerprint is required to bind device"));
        }

        Optional<LicenseKey> keyOpt = licenseKeyRepository.findByActivationKeyAndOrderId(key.trim(), orderId.trim());
        if (keyOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "License Key or Order ID not found"));
        }

        LicenseKey license = keyOpt.get();

        // 1. Check expiration
        if (license.getExpiresAt() != null && license.getExpiresAt().isBefore(LocalDateTime.now())) {
            if (license.getStatus() != LicenseStatus.EXPIRED) {
                license.setStatus(LicenseStatus.EXPIRED);
                licenseKeyRepository.save(license);
            }
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "This license key expired on " + license.getExpiresAt()));
        }

        // 2. Check revoked status
        if (license.getStatus() == LicenseStatus.REVOKED) {
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "This license key has been revoked by the administrator"));
        }

        // 3. Find existing activation
        Optional<LicenseActivation> existingActivationOpt = license.getActivations().stream()
                .filter(act -> act.getHardwareFingerprint().equals(fingerprint))
                .findFirst();

        LicenseActivation activation;
        if (existingActivationOpt.isPresent()) {
            // Already registered - update check-in
            activation = existingActivationOpt.get();
            activation.setLastCheckIn(LocalDateTime.now());
            licenseActivationRepository.save(activation);
        } else {
            // New activation - check limits
            if (license.getMaxDevices() <= 0) {
                return ResponseEntity.ok(Map.of(
                        "status", "FAILED",
                        "message", "Maximum device limit reached (" + license.getMaxDevices() + " allowed)"));
            }

            // Register new device
            activation = new LicenseActivation();
            activation.setLicenseKey(license);
            activation.setHardwareFingerprint(fingerprint);
            activation.setDeviceName(deviceName);
            activation.setActivatedAt(LocalDateTime.now());
            activation.setLastCheckIn(LocalDateTime.now());

            license.getActivations().add(activation);
            license.setMaxDevices(Math.max(0, license.getMaxDevices() - 1));
            licenseKeyRepository.save(license); // Saves key & cascaded activation
        }

        // Calculate days remaining
        long daysRemaining = -1;
        if (license.getExpiresAt() != null) {
            daysRemaining = Duration.between(LocalDateTime.now(), license.getExpiresAt()).toDays();
            if (daysRemaining < 0)
                daysRemaining = 0;
        }

        Map<String, Object> licenseInfo = new HashMap<>();
        licenseInfo.put("productId", license.getProductId());
        licenseInfo.put("tier", license.getPricingTierName());
        licenseInfo.put("maxDevices", license.getMaxDevices());
        licenseInfo.put("activeDevices", license.getActivations().size());
        licenseInfo.put("lifetime", license.getExpiresAt() == null);
        licenseInfo.put("expiresAt", license.getExpiresAt() != null ? license.getExpiresAt().toString() : null);
        licenseInfo.put("daysRemaining", daysRemaining);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message",
                existingActivationOpt.isPresent() ? "License verified successfully" : "License activated successfully",
                "licenseInfo", licenseInfo));
    }

    // ─── ADMIN BACK PANEL APIs ───────────────────────────────────────────────────

    @GetMapping("/licensing-admin")
    public ResponseEntity<List<LicenseKey>> getAllLicenses(
            @RequestParam(required = true) String siteId) {
        SecurityUtils.checkAccess(siteId);
        List<LicenseKey> licenses = licenseKeyRepository.findBySiteId(siteId);
        return ResponseEntity.ok(licenses);
    }

    @PostMapping("/licensing-admin/generate")
    public ResponseEntity<LicenseKey> generateLicense(@RequestBody Map<String, Object> request) {
        String siteId = (String) request.get("siteId");
        if (siteId == null || siteId.isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(siteId);

        String productId = (String) request.get("productId");
        String tier = (String) request.getOrDefault("pricingTierName", "Standard");
        String email = (String) request.getOrDefault("customerEmail", "");
        String orderId = (String) request.get("orderId");
        int maxDevices = Integer.parseInt(request.getOrDefault("maxDevices", "1").toString());
        int durationMonths = Integer.parseInt(request.getOrDefault("durationMonths", "0").toString());

        if (productId == null || productId.trim().isEmpty() || orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID and Order ID are required");
        }

        // Generate key format: DMP-XXXX-XXXX-XXXX
        String rawUuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        String activationKey = "DMP-" + rawUuid.substring(0, 4) + "-" + rawUuid.substring(4, 8) + "-"
                + rawUuid.substring(8, 12);

        LicenseKey license = new LicenseKey();
        license.setActivationKey(activationKey);
        license.setOrderId(orderId.trim());
        license.setProductId(productId);
        license.setPricingTierName(tier);
        license.setCustomerEmail(email.trim());
        license.setStatus(LicenseStatus.ACTIVE);
        license.setMaxDevices(maxDevices);
        license.setCreatedAt(LocalDateTime.now());
        license.setSiteId(siteId);

        if (durationMonths > 0) {
            license.setExpiresAt(LocalDateTime.now().plusMonths(durationMonths));
        } else {
            license.setExpiresAt(null); // Lifetime
        }

        LicenseKey saved = licenseKeyRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/revoke/{id}")
    public ResponseEntity<LicenseKey> revokeLicense(@PathVariable String id) {
        Optional<LicenseKey> licenseOpt = licenseKeyRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LicenseKey license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.setStatus(LicenseStatus.REVOKED);
        LicenseKey saved = licenseKeyRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/reactivate/{id}")
    public ResponseEntity<LicenseKey> reactivateLicense(@PathVariable String id) {
        Optional<LicenseKey> licenseOpt = licenseKeyRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LicenseKey license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.setStatus(LicenseStatus.ACTIVE);
        if (license.getExpiresAt() != null && license.getExpiresAt().isBefore(LocalDateTime.now())) {
            license.setExpiresAt(LocalDateTime.now().plusYears(1)); // Extend 1 year if expired
        }
        LicenseKey saved = licenseKeyRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/reset/{id}")
    public ResponseEntity<LicenseKey> resetActivations(@PathVariable String id) {
        Optional<LicenseKey> licenseOpt = licenseKeyRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LicenseKey license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.getActivations().clear();
        LicenseKey saved = licenseKeyRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    // ─── DESKTOP LICENSE ADMIN APIs
    // ────────────────────────────────────────────────

    @GetMapping("/licensing-admin/desktop")
    public ResponseEntity<List<License>> getAllDesktopLicenses(
            @RequestParam(required = true) String siteId) {
        SecurityUtils.checkAccess(siteId);
        List<License> licenses = licenseRepository.findBySiteId(siteId);
        return ResponseEntity.ok(licenses);
    }

    @PostMapping("/licensing-admin/desktop/generate")
    public ResponseEntity<License> generateDesktopLicense(@RequestBody Map<String, Object> request) {
        String siteId = (String) request.get("siteId");
        if (siteId == null || siteId.isBlank()) {
            throw new IllegalArgumentException("siteId is required");
        }
        SecurityUtils.checkAccess(siteId);

        String brandPrefix = (String) request.get("brandPrefix");
        if (brandPrefix == null || brandPrefix.trim().isEmpty()) {
            brandPrefix = switch (siteId) {
                case "brandB" -> "PSTB";
                case "brandC" -> "PSTC";
                case "brandD" -> "PSTD";
                case "brandE" -> "PSTE";
                default -> "PST";
            };
        }

        String licenseType = (String) request.getOrDefault("licenseType", "STANDARD");
        int maxActivations = Integer.parseInt(request.getOrDefault("maxActivations", "3").toString());
        int durationMonths = Integer.parseInt(request.getOrDefault("durationMonths", "12").toString());

        // Generate license parts satisfying checksums
        String s1 = generateValidPart(9);
        String s2 = generateValidPart(0);
        String s3 = generateValidPart(8);

        String licenseKeyStr = brandPrefix.toUpperCase() + "-ELITE-" + s1 + "-" + s2 + "-" + s3;

        License license = new License();
        license.setLicenseKey(licenseKeyStr);
        license.setStatus("ACTIVE");
        license.setLicenseType(licenseType.toUpperCase());
        license.setMaxActivations(maxActivations);
        license.setCreatedAt(OffsetDateTime.now());
        license.setSiteId(siteId);

        if (durationMonths > 0) {
            license.setExpiresAt(OffsetDateTime.now().plusMonths(durationMonths));
        } else {
            license.setExpiresAt(null); // Lifetime
        }

        License saved = licenseRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/desktop/revoke/{id}")
    public ResponseEntity<License> revokeDesktopLicense(@PathVariable Integer id) {
        Optional<License> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        License license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.setStatus("REVOKED");
        License saved = licenseRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/desktop/reactivate/{id}")
    public ResponseEntity<License> reactivateDesktopLicense(@PathVariable Integer id) {
        Optional<License> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        License license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.setStatus("ACTIVE");
        if (license.getExpiresAt() != null && license.getExpiresAt().isBefore(OffsetDateTime.now())) {
            license.setExpiresAt(OffsetDateTime.now().plusYears(1)); // Extend 1 year if expired
        }
        License saved = licenseRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/licensing-admin/desktop/reset/{id}")
    public ResponseEntity<License> resetDesktopActivations(@PathVariable Integer id) {
        Optional<License> licenseOpt = licenseRepository.findById(id);
        if (licenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        License license = licenseOpt.get();
        SecurityUtils.checkAccess(license.getSiteId());

        license.getActivations().clear();
        License saved = licenseRepository.save(license);
        return ResponseEntity.ok(saved);
    }

    private String generateValidPart(int targetRemainder) {
        Random rand = new Random();
        StringBuilder sb = new StringBuilder();
        // Generate first 3 characters randomly (A-Z)
        int sum = 0;
        for (int i = 0; i < 3; i++) {
            char c = (char) ('A' + rand.nextInt(26));
            sb.append(c);
            sum += c;
        }
        // Calculate the 4th character such that (sum + char) % 17 == targetRemainder
        for (char c = 'A'; c <= 'Z'; c++) {
            if ((sum + c) % 17 == targetRemainder) {
                sb.append(c);
                return sb.toString();
            }
        }
        for (char c = '0'; c <= '9'; c++) {
            if ((sum + c) % 17 == targetRemainder) {
                sb.append(c);
                return sb.toString();
            }
        }
        return generateValidPart(targetRemainder);
    }
}
