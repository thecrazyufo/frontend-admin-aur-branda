package com.datamigratepro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "brand_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandConfig {

    @Id
    @Column(nullable = false, unique = true)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String domain;

    @Column(name = "admin_domain")
    private String adminDomain;

    @Column(name = "dev_port")
    private String devPort;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "theme_colors", columnDefinition = "TEXT")
    private String themeColors; // Stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String features; // Stored as JSON string

    @Column(name = "layout_template")
    private String layoutTemplate;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
