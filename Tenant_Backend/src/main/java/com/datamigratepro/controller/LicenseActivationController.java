package com.datamigratepro.controller;

import com.datamigratepro.entity.Activation;
import com.datamigratepro.entity.License;
import com.datamigratepro.entity.LicenseKey;
import com.datamigratepro.entity.LicenseActivation;
import com.datamigratepro.entity.LicenseStatus;
import com.datamigratepro.repository.ActivationRepository;
import com.datamigratepro.repository.LicenseRepository;
import com.datamigratepro.repository.LicenseKeyRepository;
import com.datamigratepro.repository.LicenseActivationRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/api/license")
public class LicenseActivationController {

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private ActivationRepository activationRepository;

    @Autowired
    private LicenseKeyRepository licenseKeyRepository;

    @Autowired
    private LicenseActivationRepository licenseActivationRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @PostMapping("/activate")
    public ResponseEntity<ActivationResponse> activateLicense(
            @RequestBody ActivationRequest requestPayload,
            HttpServletRequest httpServletRequest) {

        String rawLicenseKey = requestPayload.getLicenseKey();
        String machineId = requestPayload.getMachineId();
        String machineName = requestPayload.getMachineName();
        String osName = requestPayload.getOsName();
        String ipAddress = requestPayload.getIpAddress();

        // 1. Fallback for client IP
        if (ipAddress == null || ipAddress.trim().isEmpty()) {
            ipAddress = httpServletRequest.getRemoteAddr();
        }

        // 2. Normalize and check validation
        if (rawLicenseKey == null || rawLicenseKey.trim().isEmpty()) {
            return ResponseEntity.ok(new ActivationResponse(
                false,
                "License key is required",
                0,
                null,
                null,
                null
            ));
        }

        String normalizedKey = rawLicenseKey.trim().toUpperCase();

        if (machineId == null || machineId.trim().isEmpty()) {
            return ResponseEntity.ok(new ActivationResponse(
                false,
                "Machine ID is required",
                0,
                null,
                null,
                null
            ));
        }

        // 3. Cryptographic Validation (Offline Verification)
        if (!validateOfflineChecksum(normalizedKey)) {
            return ResponseEntity.ok(new ActivationResponse(
                false,
                "Invalid license key checksum validation failed",
                0,
                null,
                null,
                null
            ));
        }

        // 4. Query DB for License Key
        Optional<License> licenseOpt = licenseRepository.findByLicenseKey(normalizedKey);
        if (licenseOpt.isEmpty()) {
            // Check if key exists in license_keys table (checkout licenses)
            Optional<LicenseKey> licenseKeyOpt = licenseKeyRepository.findByActivationKey(normalizedKey);
            if (licenseKeyOpt.isEmpty()) {
                return ResponseEntity.ok(new ActivationResponse(
                    false,
                    "License key not found",
                    0,
                    null,
                    null,
                    null
                ));
            }

            LicenseKey licenseKey = licenseKeyOpt.get();
            if (!licenseKey.isOfflineCapable()) {
                return ResponseEntity.ok(new ActivationResponse(
                    false,
                    "This license key does not support offline activation",
                    0,
                    null,
                    null,
                    null
                ));
            }

            // Expiration boundary check
            java.time.LocalDateTime nowLdt = java.time.LocalDateTime.now();
            if (licenseKey.getExpiresAt() != null && licenseKey.getExpiresAt().isBefore(nowLdt)) {
                if (licenseKey.getStatus() != LicenseStatus.EXPIRED) {
                    licenseKey.setStatus(LicenseStatus.EXPIRED);
                    licenseKeyRepository.save(licenseKey);
                }
                return ResponseEntity.ok(new ActivationResponse(
                    false,
                    "License has expired",
                    0,
                    formatTimestamp(licenseKey.getExpiresAt()),
                    null,
                    licenseKey.getPricingTierName()
                ));
            }

            // Revocation status check
            if (licenseKey.getStatus() == LicenseStatus.REVOKED) {
                int remaining = Math.max(0, licenseKey.getMaxDevices());
                return ResponseEntity.ok(new ActivationResponse(
                    false,
                    "License is revoked",
                    remaining,
                    formatTimestamp(licenseKey.getExpiresAt()),
                    null,
                    licenseKey.getPricingTierName()
                ));
            }

            // Find existing activation for this machine ID
            Optional<LicenseActivation> existingActivationOpt = licenseKey.getActivations().stream()
                    .filter(act -> act.getHardwareFingerprint().equals(machineId))
                    .findFirst();
            LicenseActivation licenseActivation;
            java.time.LocalDateTime now = java.time.LocalDateTime.now();

            if (existingActivationOpt.isPresent()) {
                licenseActivation = existingActivationOpt.get();
                licenseActivation.setLastCheckIn(now);
                licenseActivation.setDeviceName(machineName);
                licenseActivationRepository.save(licenseActivation);
            } else {
                // Check max activations limit
                if (licenseKey.getMaxDevices() <= 0) {
                    return ResponseEntity.ok(new ActivationResponse(
                        false,
                        "Maximum activations limit reached (" + licenseKey.getMaxDevices() + ")",
                        0,
                        formatTimestamp(licenseKey.getExpiresAt()),
                        null,
                        licenseKey.getPricingTierName()
                    ));
                }

                // Register new activation
                licenseActivation = new LicenseActivation();
                licenseActivation.setLicenseKey(licenseKey);
                licenseActivation.setHardwareFingerprint(machineId);
                licenseActivation.setDeviceName(machineName);
                licenseActivation.setActivatedAt(now);
                licenseActivation.setLastCheckIn(now);
                
                // Add to list, decrement remaining count, and save
                licenseKey.getActivations().add(licenseActivation);
                licenseKey.setMaxDevices(Math.max(0, licenseKey.getMaxDevices() - 1));
                licenseKeyRepository.save(licenseKey);
            }

            int remaining = Math.max(0, licenseKey.getMaxDevices());

            return ResponseEntity.ok(new ActivationResponse(
                true,
                "Activation successful",
                remaining,
                formatTimestamp(licenseKey.getExpiresAt()),
                formatTimestamp(licenseActivation.getActivatedAt()),
                licenseKey.getPricingTierName()
            ));
        }

        License license = licenseOpt.get();

        // 5. Expiration boundary check
        OffsetDateTime now = OffsetDateTime.now();
        if (license.getExpiresAt() != null && license.getExpiresAt().isBefore(now)) {
            if (!"EXPIRED".equals(license.getStatus())) {
                license.setStatus("EXPIRED");
                licenseRepository.save(license);
            }
            return ResponseEntity.ok(new ActivationResponse(
                false,
                "License has expired",
                0,
                formatTimestamp(license.getExpiresAt()),
                null,
                license.getLicenseType()
            ));
        }

        // 6. Revocation status check
        if ("REVOKED".equals(license.getStatus())) {
            int remaining = Math.max(0, license.getMaxActivations());
            return ResponseEntity.ok(new ActivationResponse(
                false,
                "License is revoked",
                remaining,
                formatTimestamp(license.getExpiresAt()),
                null,
                license.getLicenseType()
            ));
        }

        // 7. Find existing activation for this machine ID
        Optional<Activation> existingActivationOpt = activationRepository.findByLicenseAndMachineId(license, machineId);
        Activation activation;

        if (existingActivationOpt.isPresent()) {
            activation = existingActivationOpt.get();
            activation.setLastCheckedAt(now);
            activation.setMachineName(machineName);
            activation.setOsName(osName);
            activation.setIpAddress(ipAddress);
            activationRepository.save(activation);
        } else {
            // Check max activations limit
            if (license.getMaxActivations() <= 0) {
                return ResponseEntity.ok(new ActivationResponse(
                    false,
                    "Maximum activations limit reached (" + license.getMaxActivations() + ")",
                    0,
                    formatTimestamp(license.getExpiresAt()),
                    null,
                    license.getLicenseType()
                ));
            }

            // Register new activation
            activation = new Activation();
            activation.setLicense(license);
            activation.setMachineId(machineId);
            activation.setMachineName(machineName);
            activation.setOsName(osName);
            activation.setIpAddress(ipAddress);
            activation.setActivatedAt(now);
            activation.setLastCheckedAt(now);
            
            // Add to list, decrement remaining count, and save
            license.getActivations().add(activation);
            license.setMaxActivations(Math.max(0, license.getMaxActivations() - 1));
            licenseRepository.save(license);
        }

        int remaining = Math.max(0, license.getMaxActivations());

        return ResponseEntity.ok(new ActivationResponse(
            true,
            "Activation successful",
            remaining,
            formatTimestamp(license.getExpiresAt()),
            formatTimestamp(activation.getActivatedAt()),
            license.getLicenseType()
        ));
    }

    private boolean validateOfflineChecksum(String licenseKey) {
        if (!licenseKey.matches("^(PST|PSTB|PSTC|PSTD|PSTE)-ELITE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$")) {
            return false;
        }
        String[] parts = licenseKey.split("-");
        if (parts.length != 5) {
            return false;
        }
        String s1 = parts[2];
        String s2 = parts[3];
        String s3 = parts[4];

        return (getCharacterSum(s1) % 17 == 9) &&
               (getCharacterSum(s2) % 17 == 0) &&
               (getCharacterSum(s3) % 17 == 8);
    }

    private int getCharacterSum(String s) {
        int sum = 0;
        for (int i = 0; i < s.length(); i++) {
            sum += s.charAt(i);
        }
        return sum;
    }

    private String formatTimestamp(OffsetDateTime odt) {
        if (odt == null) {
            return null;
        }
        return odt.withOffsetSameInstant(ZoneOffset.UTC).format(ISO_FORMATTER);
    }

    private String formatTimestamp(java.time.LocalDateTime ldt) {
        if (ldt == null) {
            return null;
        }
        return formatTimestamp(ldt.atOffset(ZoneOffset.UTC));
    }

    // --- Request / Response Payloads ---

    public static class ActivationRequest {
        private String licenseKey;
        private String machineId;
        private String machineName;
        private String osName;
        private String ipAddress;

        public String getLicenseKey() { return licenseKey; }
        public void setLicenseKey(String licenseKey) { this.licenseKey = licenseKey; }

        public String getMachineId() { return machineId; }
        public void setMachineId(String machineId) { this.machineId = machineId; }

        public String getMachineName() { return machineName; }
        public void setMachineName(String machineName) { this.machineName = machineName; }

        public String getOsName() { return osName; }
        public void setOsName(String osName) { this.osName = osName; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    }

    public static class ActivationResponse {
        private boolean activated;
        private String message;
        private Integer activationsRemaining;
        private String validTill;
        private String activatedOn;
        private String licenseType;

        public ActivationResponse(boolean activated, String message, Integer activationsRemaining,
                                  String validTill, String activatedOn, String licenseType) {
            this.activated = activated;
            this.message = message;
            this.activationsRemaining = activationsRemaining;
            this.validTill = validTill;
            this.activatedOn = activatedOn;
            this.licenseType = licenseType;
        }

        public boolean isActivated() { return activated; }
        public void setActivated(boolean activated) { this.activated = activated; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Integer getActivationsRemaining() { return activationsRemaining; }
        public void setActivationsRemaining(Integer activationsRemaining) { this.activationsRemaining = activationsRemaining; }

        public String getValidTill() { return validTill; }
        public void setValidTill(String validTill) { this.validTill = validTill; }

        public String getActivatedOn() { return activatedOn; }
        public void setActivatedOn(String activatedOn) { this.activatedOn = activatedOn; }

        public String getLicenseType() { return licenseType; }
        public void setLicenseType(String licenseType) { this.licenseType = licenseType; }
    }
}
