package com.datamigratepro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    private String id;

    @Column(name = "name", nullable = false)
    private String label;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;
    private Integer count;
    private String color;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    public Category(String id, String label, String description, String icon, Integer count, String color) {
        this.id = id;
        this.label = label;
        this.slug = id;
        this.description = description;
        this.icon = icon;
        this.count = count;
        this.color = color;
    }
}
