package com.datamigratepro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "format_compatibility")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormatCompatibility {

    @Id
    private String id;

    /**
     * Normalized lowercase format key for the input/source side.
     * e.g., "pst", "gmail", "office365", "ost", "mbox"
     */
    @Column(name = "source_format", nullable = false, length = 100)
    private String sourceFormat;

    /**
     * Normalized lowercase format key for the output/target side.
     * e.g., "gmail", "pst", "google_workspace", "eml"
     */
    @Column(name = "target_format", nullable = false, length = 100)
    private String targetFormat;

    /**
     * Compatibility score from 0 (incompatible) to 100 (perfect).
     * Used to rank fuzzy matches in results.
     */
    @Column(name = "compatibility_score", nullable = false)
    private int compatibilityScore;

    /**
     * Match classification:
     * EXACT      - tool directly supports this source→target combination
     * SIMILAR    - highly related formats (same vendor ecosystem, data loss-free)
     * COMPATIBLE - can be converted but may require intermediate steps
     */
    @Column(name = "match_type", nullable = false, length = 20)
    private String matchType;

    /** Human-readable explanation of why these formats are compatible. */
    @Column(columnDefinition = "TEXT")
    private String notes;
}
