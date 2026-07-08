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
@Table(name = "client_logos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientLogo {

    @Id
    private String id;

    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "logo_url", nullable = false, length = 1024)
    private String logoUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "case_study", columnDefinition = "TEXT")
    private String caseStudy;

    /** Product IDs this client logo is linked to */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_ids", columnDefinition = "jsonb")
    private List<String> productIds;

    /** Transient: populated at query time from product names — not persisted */
    @Transient
    private List<String> productNames;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

