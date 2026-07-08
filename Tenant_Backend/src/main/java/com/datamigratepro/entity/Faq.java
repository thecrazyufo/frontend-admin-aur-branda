package com.datamigratepro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "faqs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Faq {
    @Id
    private String id;

    @Column(nullable = false)
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    private String category;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    @Column(name = "product_id")
    private String productId;

    @jakarta.persistence.Transient
    private String productName;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "product_ids", columnDefinition = "jsonb")
    private java.util.List<String> productIds = new java.util.ArrayList<>();

    @jakarta.persistence.Transient
    private java.util.List<String> productNames = new java.util.ArrayList<>();

    public Faq(String id, String question, String answer, String category) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.category = category;
    }
}
