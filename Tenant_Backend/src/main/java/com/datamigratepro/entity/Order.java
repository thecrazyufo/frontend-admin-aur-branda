package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private String pricingTierName;

    private double amount;

    private String currency;

    private String paymentStatus; // PAID, PENDING, FAILED

    private String paymentMethod; // STRIPE, PAYPAL

    private String activationKey;

    @Column(name = "billing_name")
    private String billingName;

    @Column(name = "billing_company")
    private String billingCompany;

    @Column(name = "billing_address")
    private String billingAddress;

    @Column(name = "billing_city")
    private String billingCity;

    @Column(name = "billing_state")
    private String billingState;

    @Column(name = "billing_zip")
    private String billingZip;

    @Column(name = "billing_country")
    private String billingCountry;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "tax_amount", nullable = false)
    private double taxAmount;

    @Column(name = "tax_rate", nullable = false)
    private double taxRate;

    private LocalDateTime createdAt;

    @org.hibernate.annotations.TenantId
    @Column(name = "site_id", nullable = false)
    private String siteId;
}
