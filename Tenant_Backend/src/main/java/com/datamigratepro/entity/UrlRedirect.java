package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "url_redirects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrlRedirect {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_path", nullable = false)
    private String sourcePath;

    @Column(name = "target_path", nullable = false)
    private String targetPath;

    @Column(name = "redirect_type", nullable = false)
    private int redirectType = 301;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;
}
