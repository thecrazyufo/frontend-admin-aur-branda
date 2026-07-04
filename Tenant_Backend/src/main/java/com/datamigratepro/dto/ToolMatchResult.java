package com.datamigratepro.dto;

import com.datamigratepro.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response item for GET /api/tools/match
 * Each item contains the full product plus match metadata so the frontend
 * can show "Perfect Match" vs "Also Works" badges and sort by relevance.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToolMatchResult {

    /** The full product object — same shape as existing /api/products responses. */
    private Product product;

    /**
     * How well this product matches the requested source→target combination.
     * Values: "PERFECT_MATCH", "SIMILAR", "COMPATIBLE"
     */
    private String matchType;

    /**
     * Numeric score 0–100 describing match quality.
     * 100 = product directly supports source→target.
     * Lower = fuzzy match via FormatCompatibility knowledge base.
     */
    private int score;

    /**
     * Human-readable explanation of why this product was matched.
     * e.g., "Directly converts PST to Gmail" or "Supports PST input format"
     */
    private String matchReason;
}
