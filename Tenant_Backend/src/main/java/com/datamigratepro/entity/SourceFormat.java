package com.datamigratepro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "source_formats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SourceFormat {
    @Id
    private String id;

    @Column(name = "format_key", nullable = false)
    private String key;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(name = "supports_multiple_accounts", nullable = false)
    private boolean supportsMultipleAccounts = false;

    public SourceFormat(String id, String key, String name, String description, String icon, String siteId) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.siteId = siteId;
        this.supportsMultipleAccounts = false;
    }
}
