package com.datamigratepro.service;

import com.datamigratepro.dto.AvailableFormatsResponse;
import com.datamigratepro.dto.ToolMatchResult;
import com.datamigratepro.entity.FormatCompatibility;
import com.datamigratepro.entity.Product;
import com.datamigratepro.repository.FormatCompatibilityRepository;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.repository.SourceFormatRepository;
import com.datamigratepro.repository.TargetFormatRepository;
import com.datamigratepro.repository.KeyFeatureRepository;
import com.datamigratepro.entity.SourceFormat;
import com.datamigratepro.entity.TargetFormat;
import com.datamigratepro.entity.KeyFeature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core service for the "Find Your Tool" feature.
 *
 * Design principles:
 * - All matching logic is isolated here (not in the controller) for testability.
 * - The method signature is designed to be extended: future filters (platform, price range, etc.)
 *   can be added as optional parameters without breaking existing callers.
 * - Minimum score threshold: 30 (weak matches below this are excluded).
 */
@Service
public class ToolMatcherService {

    private static final int MIN_FUZZY_SCORE = 30;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FormatCompatibilityRepository formatCompatibilityRepository;

    @Autowired
    private SourceFormatRepository sourceFormatRepository;

    @Autowired
    private TargetFormatRepository targetFormatRepository;

    @Autowired
    private KeyFeatureRepository keyFeatureRepository;

    /**
     * Static lookup map: normalized format key → display metadata.
     * Centralizing this here keeps the database lean and avoids a separate admin UI for labels.
     * To add new formats: just add an entry to this map.
     */
    private static final Map<String, AvailableFormatsResponse.FormatOption> FORMAT_METADATA = new LinkedHashMap<>();

    static {
        FORMAT_METADATA.put("pst",              new AvailableFormatsResponse.FormatOption("pst",              "PST (Outlook Data File)",   "microsoft-outlook",   "Outlook email archive file",              "Microsoft"));
        FORMAT_METADATA.put("ost",              new AvailableFormatsResponse.FormatOption("ost",              "OST (Offline Storage)",     "microsoft-outlook",   "Exchange offline cache file",             "Microsoft"));
        FORMAT_METADATA.put("outlook",          new AvailableFormatsResponse.FormatOption("outlook",          "Outlook (Live Account)",    "microsoft-outlook",   "Live Microsoft Outlook mailbox",          "Microsoft"));
        FORMAT_METADATA.put("office365",        new AvailableFormatsResponse.FormatOption("office365",        "Microsoft 365",             "microsoft",           "Microsoft 365 / Exchange Online",         "Microsoft"));
        FORMAT_METADATA.put("exchange_online",  new AvailableFormatsResponse.FormatOption("exchange_online",  "Exchange Online",           "microsoftexchange",   "Exchange Online (Office 365 mail)",        "Microsoft"));
        FORMAT_METADATA.put("gmail",            new AvailableFormatsResponse.FormatOption("gmail",            "Gmail",                     "gmail",               "Google Gmail mailbox",                    "Google"));
        FORMAT_METADATA.put("google_workspace", new AvailableFormatsResponse.FormatOption("google_workspace", "Google Workspace",          "google",              "Google Workspace / G Suite account",      "Google"));
        FORMAT_METADATA.put("mbox",             new AvailableFormatsResponse.FormatOption("mbox",             "MBOX",                      "thunderbird",         "Open standard mailbox format (Thunderbird/Apple Mail)", "Open Standard"));
        FORMAT_METADATA.put("eml",              new AvailableFormatsResponse.FormatOption("eml",              "EML (Email File)",          "mail",                "Individual email file format",            "Open Standard"));
        FORMAT_METADATA.put("msg",              new AvailableFormatsResponse.FormatOption("msg",              "MSG (Outlook Message)",     "microsoft-outlook",   "Outlook individual message file",         "Microsoft"));
        FORMAT_METADATA.put("pdf",              new AvailableFormatsResponse.FormatOption("pdf",              "PDF",                       "adobeacrobatreader",  "Portable Document Format (read-only)",    "Adobe"));
        FORMAT_METADATA.put("html",             new AvailableFormatsResponse.FormatOption("html",             "HTML",                      "html5",               "Web browser readable email archive",      "Open Standard"));
        FORMAT_METADATA.put("onedrive",         new AvailableFormatsResponse.FormatOption("onedrive",         "OneDrive",                  "microsoftonedrive",   "Microsoft OneDrive cloud storage",        "Microsoft"));
        FORMAT_METADATA.put("sharepoint",       new AvailableFormatsResponse.FormatOption("sharepoint",       "SharePoint",                "microsoftsharepoint", "Microsoft SharePoint document library",   "Microsoft"));
        FORMAT_METADATA.put("google_drive",     new AvailableFormatsResponse.FormatOption("google_drive",     "Google Drive",              "googledrive",         "Google Drive cloud storage",              "Google"));
    }

    /**
     * Match products to a source → target format request.
     *
     * @param sourceFormat  Normalized source format key (e.g., "pst")
     * @param targetFormat  Normalized target format key (e.g., "gmail")
     * @param siteId        Tenant site ID for isolation
     * @return              Ranked list of ToolMatchResult, best matches first
     */
    public List<ToolMatchResult> matchTools(String sourceFormat, String targetFormat, String siteId) {
        String src = normalize(sourceFormat);
        String tgt = normalize(targetFormat);

        List<Product> allProducts = productRepository.findBySiteId(siteId)
                .stream()
                .filter(Product::isEnabled)
                .filter(p -> p.getSourceFormats() != null && p.getTargetFormats() != null)
                .collect(Collectors.toList());

        Map<String, ToolMatchResult> resultMap = new LinkedHashMap<>();

        // ── PASS 1: Perfect matches (product directly supports src → tgt) ──────────
        for (Product product : allProducts) {
            boolean srcMatch = product.getSourceFormats().stream().map(this::normalize).anyMatch(src::equals);
            boolean tgtMatch = product.getTargetFormats().stream().map(this::normalize).anyMatch(tgt::equals);

            if (srcMatch && tgtMatch) {
                resultMap.put(product.getId(), new ToolMatchResult(
                        product, "PERFECT_MATCH", 100,
                        "Directly converts " + formatLabel(src) + " to " + formatLabel(tgt)
                ));
            }
        }

        // ── PASS 2: Fuzzy matches via FormatCompatibility knowledge base ──────────
        // Find compatible source formats (what formats are similar to the requested source?)
        List<FormatCompatibility> srcCompatible = formatCompatibilityRepository
                .findBySourceFormatWithMinScore(src, MIN_FUZZY_SCORE);

        // Find compatible target formats (what formats are similar to the requested target?)
        List<FormatCompatibility> tgtCompatible = formatCompatibilityRepository
                .findByTargetFormat(tgt).stream()
                .filter(fc -> fc.getCompatibilityScore() >= MIN_FUZZY_SCORE)
                .collect(Collectors.toList());

        Set<String> compatibleSrcFormats = srcCompatible.stream()
                .map(FormatCompatibility::getTargetFormat)
                .collect(Collectors.toSet());
        compatibleSrcFormats.add(src); // include original

        Set<String> compatibleTgtFormats = tgtCompatible.stream()
                .map(FormatCompatibility::getSourceFormat)
                .collect(Collectors.toSet());
        compatibleTgtFormats.add(tgt); // include original

        for (Product product : allProducts) {
            if (resultMap.containsKey(product.getId())) continue; // already a perfect match

            List<String> prodSrc = product.getSourceFormats().stream().map(this::normalize).collect(Collectors.toList());
            List<String> prodTgt = product.getTargetFormats().stream().map(this::normalize).collect(Collectors.toList());

            boolean srcFuzzy = prodSrc.stream().anyMatch(compatibleSrcFormats::contains);
            boolean tgtFuzzy = prodTgt.stream().anyMatch(compatibleTgtFormats::contains);

            if (!srcFuzzy && !tgtFuzzy) continue;

            // Calculate best score from compatibility rules
            int bestScore = 0;
            String bestMatchType = "COMPATIBLE";
            String bestReason = "";

            for (String ps : prodSrc) {
                for (FormatCompatibility fc : srcCompatible) {
                    if (ps.equals(fc.getTargetFormat())) {
                        if (fc.getCompatibilityScore() > bestScore) {
                            bestScore = fc.getCompatibilityScore();
                            bestMatchType = fc.getMatchType();
                            bestReason = "Supports " + formatLabel(ps) + " which is " + fc.getMatchType().toLowerCase() + " with " + formatLabel(src);
                        }
                    }
                }
            }

            for (String pt : prodTgt) {
                for (FormatCompatibility fc : tgtCompatible) {
                    if (pt.equals(fc.getSourceFormat())) {
                        // Average the score with target compatibility
                        int combined = (bestScore > 0) ? (bestScore + fc.getCompatibilityScore()) / 2 : fc.getCompatibilityScore();
                        if (combined > bestScore) {
                            bestScore = combined;
                            if ("EXACT".equals(fc.getMatchType())) bestMatchType = "SIMILAR";
                            bestReason = "Can produce " + formatLabel(pt) + " which is compatible with " + formatLabel(tgt);
                        }
                    }
                }
            }

            // Ensure fuzzy matches score below perfect (cap at 99)
            bestScore = Math.min(bestScore, 99);

            if (bestScore >= MIN_FUZZY_SCORE) {
                resultMap.put(product.getId(), new ToolMatchResult(product, bestMatchType, bestScore, bestReason));
            }
        }

        // ── Sort: PERFECT_MATCH first, then by score desc ────────────────────────
        return resultMap.values().stream()
                .sorted(Comparator
                        .comparing((ToolMatchResult r) -> "PERFECT_MATCH".equals(r.getMatchType()) ? 0 : 1)
                        .thenComparing(Comparator.comparingInt(ToolMatchResult::getScore).reversed()))
                .collect(Collectors.toList());
    }

    /**
     * Overloaded matchTools method supporting advanced capabilities filtering (multiple accounts, CSV batch, impersonation).
     */
    public List<ToolMatchResult> matchTools(String sourceFormat, String targetFormat, String siteId,
                                            Boolean multipleAccounts, Boolean requireBatchCsv, Boolean requireImpersonation) {

        List<ToolMatchResult> baseResults = matchTools(sourceFormat, targetFormat, siteId);

        if ((multipleAccounts == null || !multipleAccounts) &&
            (requireBatchCsv == null || !requireBatchCsv) &&
            (requireImpersonation == null || !requireImpersonation)) {
            return baseResults;
        }

        List<ToolMatchResult> adjustedResults = new ArrayList<>();

        for (ToolMatchResult result : baseResults) {
            Product product = result.getProduct();
            Map<String, Boolean> caps = product.getCapabilities();
            if (caps == null) caps = new HashMap<>();

            boolean keep = true;
            int scoreAdjustment = 0;

            // Multiple accounts requested
            if (Boolean.TRUE.equals(multipleAccounts)) {
                boolean supportsMultiple = caps.getOrDefault("supportsMultipleAccounts", false);
                if (supportsMultiple) {
                    scoreAdjustment += 10;
                } else {
                    scoreAdjustment -= 20;
                }
            }

            // Batch CSV required
            if (Boolean.TRUE.equals(requireBatchCsv)) {
                boolean supportsBatchCsv = caps.getOrDefault("supportsBatchCsv", false);
                if (!supportsBatchCsv) {
                    keep = false;
                } else {
                    scoreAdjustment += 15;
                }
            }

            // Impersonation required
            if (Boolean.TRUE.equals(requireImpersonation)) {
                boolean supportsImpersonation = caps.getOrDefault("supportsImpersonation", false);
                if (!supportsImpersonation) {
                    keep = false;
                } else {
                    scoreAdjustment += 15;
                }
            }

            if (keep) {
                int finalScore = Math.max(0, Math.min(100, result.getScore() + scoreAdjustment));
                String finalMatchType = result.getMatchType();
                if (finalScore < 100 && "PERFECT_MATCH".equals(finalMatchType)) {
                    finalMatchType = "SIMILAR";
                }

                String extraReason = "";
                if (Boolean.TRUE.equals(requireBatchCsv)) {
                    extraReason = " (Supports Batch CSV migration)";
                } else if (Boolean.TRUE.equals(requireImpersonation)) {
                    extraReason = " (Supports Application Impersonation)";
                } else if (Boolean.TRUE.equals(multipleAccounts) && caps.getOrDefault("supportsMultipleAccounts", false)) {
                    extraReason = " (Optimized for multiple accounts)";
                }

                adjustedResults.add(new ToolMatchResult(
                    product,
                    finalMatchType,
                    finalScore,
                    result.getMatchReason() + extraReason
                ));
            }
        }

        return adjustedResults.stream()
                .sorted(Comparator
                        .comparing((ToolMatchResult r) -> "PERFECT_MATCH".equals(r.getMatchType()) ? 0 : 1)
                        .thenComparing(Comparator.comparingInt(ToolMatchResult::getScore).reversed()))
                .collect(Collectors.toList());
    }

    /**
     * Return all distinct source and target formats from enabled products for a site.
     * Only returns formats that have metadata in the FORMAT_METADATA map.
     * Unknown formats are still included with a generated label.
     */
    public AvailableFormatsResponse getAvailableFormats(String siteId) {
        List<Product> products = productRepository.findBySiteId(siteId)
                .stream()
                .filter(Product::isEnabled)
                .collect(Collectors.toList());

        Set<String> srcKeys = new LinkedHashSet<>();
        Set<String> tgtKeys = new LinkedHashSet<>();

        for (Product p : products) {
            if (p.getSourceFormats() != null) {
                p.getSourceFormats().stream().map(this::normalize).forEach(srcKeys::add);
            }
            if (p.getTargetFormats() != null) {
                p.getTargetFormats().stream().map(this::normalize).forEach(tgtKeys::add);
            }
        }

        // Fetch dynamic registries for site/brand
        List<SourceFormat> dbSources = sourceFormatRepository.findBySiteId(siteId);
        List<TargetFormat> dbTargets = targetFormatRepository.findBySiteId(siteId);

        Map<String, SourceFormat> dbSourceMap = dbSources.stream()
                .collect(Collectors.toMap(SourceFormat::getKey, sf -> sf, (sf1, sf2) -> sf1));
        Map<String, TargetFormat> dbTargetMap = dbTargets.stream()
                .collect(Collectors.toMap(TargetFormat::getKey, tf -> tf, (tf1, tf2) -> tf1));

        List<AvailableFormatsResponse.FormatOption> srcOptions = srcKeys.stream()
                .map(k -> {
                    SourceFormat sf = dbSourceMap.get(k);
                    if (sf != null) {
                        return new AvailableFormatsResponse.FormatOption(sf.getKey(), sf.getName(), sf.getIcon() != null ? sf.getIcon() : "file", sf.getDescription(), "Registry");
                    }
                    return FORMAT_METADATA.getOrDefault(k, generateFallbackOption(k));
                })
                .collect(Collectors.toList());

        List<AvailableFormatsResponse.FormatOption> tgtOptions = tgtKeys.stream()
                .map(k -> {
                    TargetFormat tf = dbTargetMap.get(k);
                    if (tf != null) {
                        return new AvailableFormatsResponse.FormatOption(tf.getKey(), tf.getName(), tf.getIcon() != null ? tf.getIcon() : "file", tf.getDescription(), "Registry");
                    }
                    return FORMAT_METADATA.getOrDefault(k, generateFallbackOption(k));
                })
                .collect(Collectors.toList());

        return new AvailableFormatsResponse(srcOptions, tgtOptions);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private String normalize(String format) {
        if (format == null) return "";
        return format.toLowerCase()
                .trim()
                .replaceAll("[\\s]+", "_")     // spaces to underscores
                .replaceAll("[^a-z0-9_]", ""); // strip special chars
    }

    private String formatLabel(String key) {
        AvailableFormatsResponse.FormatOption opt = FORMAT_METADATA.get(key);
        return opt != null ? opt.getLabel() : key.toUpperCase();
    }

    private AvailableFormatsResponse.FormatOption generateFallbackOption(String key) {
        String label = key.replace("_", " ").toUpperCase();
        return new AvailableFormatsResponse.FormatOption(key, label, "file", label + " format", "Other");
    }

    /**
     * Human-readable labels for known capability keys.
     * When a new capability is added to a product, add its label here for the wizard UI.
     */
    private static final Map<String, String> CAPABILITY_LABELS = new LinkedHashMap<>();

    static {
        CAPABILITY_LABELS.put("supportsMultipleAccounts",  "Migrate Multiple Accounts / Mailboxes");
        CAPABILITY_LABELS.put("supportsBatchCsv",          "Batch Migration via CSV Import");
        CAPABILITY_LABELS.put("supportsImpersonation",     "Admin / Application Impersonation");
        CAPABILITY_LABELS.put("supportsScheduledMigration","Scheduled / Automated Migration");
        CAPABILITY_LABELS.put("supportsIncrementalSync",   "Incremental / Delta Sync");
        CAPABILITY_LABELS.put("supportsOfflineMode",       "Offline / No-Internet Mode");
        CAPABILITY_LABELS.put("supportsEncryption",        "End-to-End Encryption Support");
        CAPABILITY_LABELS.put("supportsAuditLog",          "Audit Log / Migration Report");
    }

    /**
     * Returns the union of capability keys that are set to {@code true} across all products
     * that match the given source → target pair for a specific site.
     *
     * <p>Used by {@code GET /api/tools/capabilities} to dynamically populate the wizard quiz
     * step — only capability questions that are actually relevant to the matched products
     * will be rendered.</p>
     *
     * @param sourceFormat Normalized source format key (e.g. "pst")
     * @param targetFormat Normalized target format key (e.g. "gmail")
     * @param siteId       Tenant site ID
     * @return Map with "availableCapabilities" (ordered list of capability keys) and
     *         "capabilityLabels" (key → human-readable label)
     */
    public Map<String, Object> getMatchCapabilities(String sourceFormat, String targetFormat, String siteId) {
        // Run base match to find candidate products
        List<ToolMatchResult> baseResults = matchTools(sourceFormat, targetFormat, siteId);

        // Collect the union of all capability keys that are TRUE across candidate products
        Set<String> availableCapabilities = new LinkedHashSet<>();
        for (ToolMatchResult result : baseResults) {
            Map<String, Boolean> caps = result.getProduct().getCapabilities();
            if (caps != null) {
                caps.entrySet().stream()
                    .filter(e -> Boolean.TRUE.equals(e.getValue()))
                    .map(Map.Entry::getKey)
                    .forEach(availableCapabilities::add);
            }
        }

        // Build labels map using the key features registry for this site
        List<KeyFeature> dbFeatures = keyFeatureRepository.findBySiteId(siteId);
        Map<String, String> dbFeatureMap = dbFeatures.stream()
                .collect(Collectors.toMap(KeyFeature::getKey, KeyFeature::getName, (kf1, kf2) -> kf1));

        Map<String, String> labels = new LinkedHashMap<>();
        for (String key : availableCapabilities) {
            if (dbFeatureMap.containsKey(key)) {
                labels.put(key, dbFeatureMap.get(key));
            } else if (CAPABILITY_LABELS.containsKey(key)) {
                labels.put(key, CAPABILITY_LABELS.get(key));
            } else {
                String generated = key
                    .replaceAll("([A-Z])", " $1")
                    .replaceFirst("^supports ", "Supports ")
                    .trim();
                labels.put(key, generated);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("availableCapabilities", new ArrayList<>(availableCapabilities));
        response.put("capabilityLabels", labels);
        response.put("totalMatchingProducts", baseResults.size());
        return response;
    }
}

