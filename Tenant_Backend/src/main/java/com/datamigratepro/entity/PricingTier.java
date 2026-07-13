package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
public class PricingTier implements Serializable {
    private String name;
    private double price;
    private Double originalPrice; // optional, can be null
    private String period;
    private List<String> features;
    private String cta;
    private String mailboxes;
    private boolean popular;
    private String bestFor;
    private String description;

    // Backward-compatible constructor for DevDatabaseSeeder
    public PricingTier(String name, double price, Double originalPrice, String period,
                       List<String> features, String cta, String mailboxes, boolean popular) {
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.period = period;
        this.features = features;
        this.cta = cta;
        this.mailboxes = mailboxes;
        this.popular = popular;
        this.bestFor = null;
        this.description = null;
    }

    // Full constructor
    public PricingTier(String name, double price, Double originalPrice, String period,
                       List<String> features, String cta, String mailboxes, boolean popular,
                       String bestFor, String description) {
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.period = period;
        this.features = features;
        this.cta = cta;
        this.mailboxes = mailboxes;
        this.popular = popular;
        this.bestFor = bestFor;
        this.description = description;
    }
}
