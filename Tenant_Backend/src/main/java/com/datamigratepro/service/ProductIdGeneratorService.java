package com.datamigratepro.service;

import com.datamigratepro.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
public class ProductIdGeneratorService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Maps product categories to 3-letter codes for the ID sequence format.
     */
    public static String getCategoryCode(String category) {
        if (category == null) return "GEN";
        switch (category.toLowerCase().trim()) {
            case "email-migration":
            case "email_migration":
                return "MIG";
            case "backup":
                return "BKP";
            case "file-converter":
            case "file_converter":
                return "CON";
            case "cloud-migration":
            case "cloud_migration":
                return "CLD";
            case "mailbox-recovery":
            case "mailbox_recovery":
                return "REC";
            default:
                return "GEN";
        }
    }

    /**
     * Generates a permanent, unique product ID in format: PRM-[CATEGORY]-[YEAR]-[SEQUENCE]
     * e.g., PRM-MIG-2026-001
     */
    public synchronized String generateProductId(String category) {
        String categoryCode = getCategoryCode(category);
        int year = Year.now().getValue();
        String prefix = "PRM-" + categoryCode + "-" + year + "-";

        List<String> existingIds = productRepository.findIdsStartingWith(prefix);
        int maxSeq = 0;
        for (String id : existingIds) {
            try {
                String seqStr = id.substring(prefix.length());
                int seq = Integer.parseInt(seqStr);
                if (seq > maxSeq) {
                    maxSeq = seq;
                }
            } catch (NumberFormatException | IndexOutOfBoundsException e) {
                // Ignore malformed IDs
            }
        }
        
        return prefix + String.format("%03d", maxSeq + 1);
    }
}
