package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "licenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class License {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "license_key", nullable = false, unique = true, length = 50)
    private String licenseKey;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // 'ACTIVE', 'EXPIRED', 'REVOKED'

    @Column(name = "license_type", nullable = false, length = 30)
    private String licenseType = "STANDARD"; // 'STANDARD', 'BUSINESS', 'ENTERPRISE'

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "max_activations")
    private Integer maxActivations = 3;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @OneToMany(mappedBy = "license", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Activation> activations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
    }
}
