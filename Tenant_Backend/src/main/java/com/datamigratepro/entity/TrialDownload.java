package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trial_downloads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrialDownload {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String productSlug;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime downloadedAt;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;
}
