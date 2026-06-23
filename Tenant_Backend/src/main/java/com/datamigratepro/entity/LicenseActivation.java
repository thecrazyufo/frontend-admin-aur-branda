package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Entity
@Table(name = "legacy_license_activations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenseActivation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_key_id", nullable = false)
    @JsonBackReference
    private LicenseKey licenseKey;

    @Column(nullable = false)
    private String hardwareFingerprint;

    private String deviceName;

    private LocalDateTime activatedAt;
    private LocalDateTime lastCheckIn;
}
