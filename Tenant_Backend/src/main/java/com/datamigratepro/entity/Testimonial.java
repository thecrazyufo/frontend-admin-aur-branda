package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "testimonials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Testimonial {

    @Id
    private String id;

    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_title")
    private String authorTitle;

    @Column(name = "company")
    private String company;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "rating", nullable = false)
    private Integer rating = 5;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    /** Product IDs this testimonial is linked to */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_ids", columnDefinition = "jsonb")
    private List<String> productIds;

    /** Transient: populated at query time from product names — not persisted */
    @Transient
    private List<String> productNames;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

