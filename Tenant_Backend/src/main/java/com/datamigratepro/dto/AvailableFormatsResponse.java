package com.datamigratepro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response for GET /api/formats/available
 * Returns all distinct source and target formats across enabled products for a site.
 * Powers the wizard dropdowns dynamically — no hardcoded lists in the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableFormatsResponse {

    /** All formats available as a migration/conversion source (input). */
    private List<FormatOption> sourceFormats;

    /** All formats available as a migration/conversion target (output). */
    private List<FormatOption> targetFormats;

    /**
     * A single selectable format option in the wizard UI.
     * Extensible: add more display metadata here without changing the API contract.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormatOption {

        /** Normalized key matching Product.sourceFormats/targetFormats values. e.g., "pst" */
        private String key;

        /** Human-readable display label. e.g., "PST (Outlook Data File)" */
        private String label;

        /**
         * Icon identifier for the wizard UI cards.
         * Corresponds to simple-icons brand names or custom icon names in the storefront.
         * e.g., "microsoft-outlook", "gmail", "mbox"
         */
        private String icon;

        /** Short description shown under the icon card. */
        private String description;

        /** Vendor/platform category for grouping in the UI. e.g., "Microsoft", "Google", "Open Standard" */
        private String vendor;

        /**
         * UI grouping category for the wizard tab bar.
         * e.g., "Email", "Cloud Platform", "File Format", "Calendar", "Contacts", "Image"
         * Derived from the category column in source_formats / target_formats registry tables.
         */
        private String category;

        /** Convenience constructor for legacy static FORMAT_METADATA map (no category). */
        public FormatOption(String key, String label, String icon, String description, String vendor) {
            this.key = key;
            this.label = label;
            this.icon = icon;
            this.description = description;
            this.vendor = vendor;
            this.category = null;
        }
    }
}
