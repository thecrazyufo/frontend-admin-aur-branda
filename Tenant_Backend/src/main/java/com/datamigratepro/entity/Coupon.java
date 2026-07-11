package com.datamigratepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    private String id;

    @Column(nullable = false)
    private String code;

    @Column(name = "discount_percentage", nullable = false)
    private int discountPercentage;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;

    // Constructors
    public Coupon() {}

    public Coupon(String id, String code, int discountPercentage, boolean active, LocalDateTime expiresAt, String siteId) {
        this.id = id;
        this.code = code;
        this.discountPercentage = discountPercentage;
        this.active = active;
        this.expiresAt = expiresAt;
        this.siteId = siteId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(int discountPercentage) { this.discountPercentage = discountPercentage; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String getSiteId() { return siteId; }
    public void setSiteId(String siteId) { this.siteId = siteId; }
}
