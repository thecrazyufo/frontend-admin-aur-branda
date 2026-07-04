package com.datamigratepro.controller;

import com.datamigratepro.dto.AvailableFormatsResponse;
import com.datamigratepro.dto.ToolMatchResult;
import com.datamigratepro.security.SecurityUtils;
import com.datamigratepro.service.ToolMatcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the "Find Your Tool" feature.
 *
 * All endpoints are PUBLIC (no authentication required) so that storefront
 * visitors can use the tool finder without logging in.
 *
 * Tenant isolation is enforced via the siteId parameter, consistent with
 * other public storefront API endpoints (ProductController, etc.).
 */
@RestController
public class ToolFinderController {

    @Autowired
    private ToolMatcherService toolMatcherService;

    /**
     * GET /api/tools/match
     *
     * Returns a ranked list of products matching the requested source → target format combination.
     * Includes both exact matches ("PERFECT_MATCH") and fuzzy compatible matches ("SIMILAR", "COMPATIBLE").
     *
     * @param source  Normalized source format key, e.g., "pst", "gmail", "office365"
     * @param destination  Normalized target format key, e.g., "gmail", "mbox", "google_workspace"
     * @param siteId  Tenant site ID (required for tenant isolation)
     *
     * Example: GET /api/tools/match?source=pst&destination=gmail&siteId=brandA
     */
    @GetMapping("/api/tools/match")
    public ResponseEntity<List<ToolMatchResult>> matchTools(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam String siteId,
            @RequestParam(required = false) Boolean multipleAccounts,
            @RequestParam(required = false) Boolean requireBatchCsv,
            @RequestParam(required = false) Boolean requireImpersonation) {

        SecurityUtils.checkAccess(siteId);

        if (source == null || source.isBlank() || destination == null || destination.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        List<ToolMatchResult> results = toolMatcherService.matchTools(
                source, destination, siteId, 
                multipleAccounts, requireBatchCsv, requireImpersonation
        );
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/formats/available
     *
     * Returns all unique source and target formats across all enabled products for a site.
     * Used by the wizard frontend to dynamically populate format selection cards —
     * no hardcoded lists in the UI.
     *
     * @param siteId  Tenant site ID (required for tenant isolation)
     *
     * Example: GET /api/formats/available?siteId=brandA
     */
    @GetMapping("/api/formats/available")
    public ResponseEntity<AvailableFormatsResponse> getAvailableFormats(
            @RequestParam String siteId) {

        SecurityUtils.checkAccess(siteId);

        AvailableFormatsResponse response = toolMatcherService.getAvailableFormats(siteId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/tools/capabilities
     *
     * Returns the union of capability keys (e.g. "supportsMultipleAccounts") that are set to
     * {@code true} across all products matching a given source → target pair for a site.
     *
     * <p>Used by the wizard frontend's Step 2.5 quiz to dynamically render filter questions.
     * Only capabilities that are actually present on at least one matching product will be
     * returned — so if no products support "supportsImpersonation", that question will not
     * appear in the wizard.</p>
     *
     * @param source       Normalized source format key, e.g., "pst"
     * @param destination  Normalized target format key, e.g., "gmail"
     * @param siteId       Tenant site ID
     *
     * Example: GET /api/tools/capabilities?source=office365&destination=gmail&siteId=brandA
     */
    @GetMapping("/api/tools/capabilities")
    public ResponseEntity<java.util.Map<String, Object>> getMatchCapabilities(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam String siteId) {

        SecurityUtils.checkAccess(siteId);

        if (source == null || source.isBlank() || destination == null || destination.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        java.util.Map<String, Object> result = toolMatcherService.getMatchCapabilities(source, destination, siteId);
        return ResponseEntity.ok(result);
    }
}

