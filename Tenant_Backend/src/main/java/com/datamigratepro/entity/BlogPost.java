package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "blog_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Author author;

    private String publishedAt;
    private Integer readTime;
    private String coverImage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Seo seo;

    /** Product IDs this blog post is linked to */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_ids", columnDefinition = "jsonb")
    private List<String> productIds;

    /** Transient: populated at query time from product names — not persisted */
    @Transient
    private List<String> productNames;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;
}

