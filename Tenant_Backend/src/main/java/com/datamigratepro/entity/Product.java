package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;

    private double rating;
    private int reviewCount;
    private String downloads;
    private String badge;
    private String version;
    private String lastUpdated;
    private String trialDownloadUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> features;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> platforms;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> supportedFormats;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Screenshot> screenshots;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<PricingTier> pricing;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<LicenseComparisonRow> licenseComparison;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private SystemRequirements systemRequirements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<HowItWorksStep> howItWorks;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ProductFaq> faqs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ProductReview> reviews;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> relatedProductIds;

    /**
     * Normalized source formats this tool accepts as input.
     * e.g., ["pst", "ost", "outlook"] — used for Find Your Tool matching.
     * Keys are lowercase and normalized (see FormatCompatibility for key conventions).
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "source_formats", columnDefinition = "jsonb")
    private List<String> sourceFormats;

    /**
     * Normalized target/output formats this tool can produce.
     * e.g., ["gmail", "google_workspace"] — used for Find Your Tool matching.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_formats", columnDefinition = "jsonb")
    private List<String> targetFormats;

    /**
     * Extensible capabilities map for Find Your Tool filters.
     * e.g., {"supportsBatchCsv": true, "supportsImpersonation": true, "supportsMultipleAccounts": true}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Boolean> capabilities = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Seo seo;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;
}
