package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.OffsetDateTime;

@Entity
@Table(name = "license_activations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"license_id", "machine_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_id", nullable = false)
    @JsonBackReference
    private License license;

    @Column(name = "machine_id", nullable = false, length = 100)
    private String machineId;

    @Column(name = "machine_name", length = 100)
    private String machineName;

    @Column(name = "os_name", length = 100)
    private String osName;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @Column(name = "last_checked_at")
    private OffsetDateTime lastCheckedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (activatedAt == null) {
            activatedAt = now;
        }
        if (lastCheckedAt == null) {
            lastCheckedAt = now;
        }
    }
}
