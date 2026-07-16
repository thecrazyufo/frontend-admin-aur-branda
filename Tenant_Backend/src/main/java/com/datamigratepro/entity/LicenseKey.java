package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "license_keys")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenseKey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String activationKey; // Format: DMP-XXXX-XXXX-XXXX

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private String pricingTierName; // Standard, Business, Enterprise

    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LicenseStatus status;

    private int maxDevices; // Maximum concurrent activations allowed

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt; // null for lifetime licenses

    @Column(name = "is_offline_capable", nullable = false)
    private boolean isOfflineCapable = false;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @OneToMany(mappedBy = "licenseKey", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<LicenseActivation> activations = new ArrayList<>();
}
