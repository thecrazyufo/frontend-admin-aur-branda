package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "help_articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpArticle {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;

    private String publishedAt;
    private Integer helpful;
    private Integer notHelpful;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(name = "product_id")
    private String productId;

    @Transient
    private String productName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_ids", columnDefinition = "jsonb")
    private List<String> productIds = new java.util.ArrayList<>();

    @Transient
    private List<String> productNames = new java.util.ArrayList<>();
}
