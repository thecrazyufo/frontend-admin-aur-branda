package com.datamigratepro.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingTier implements Serializable {
    private String name;
    private double price;
    private Double originalPrice; // optional, can be null
    private String period;
    private List<String> features;
    private String cta;
    private String mailboxes;
    private boolean popular;
}
