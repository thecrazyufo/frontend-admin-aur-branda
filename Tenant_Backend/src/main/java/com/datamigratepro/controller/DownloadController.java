package com.datamigratepro.controller;

import com.datamigratepro.dto.TrialDownloadRequest;
import com.datamigratepro.entity.Product;
import com.datamigratepro.entity.TrialDownload;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.repository.TrialDownloadRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/download")
public class DownloadController {

    @Autowired
    private TrialDownloadRepository trialDownloadRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/trial")
    public ResponseEntity<Map<String, String>> registerTrialDownload(
            @Valid @RequestBody TrialDownloadRequest request,
            @RequestParam(required = false, defaultValue = "default") String siteId) {

        TrialDownload lead = new TrialDownload();
        lead.setEmail(request.getEmail());
        lead.setProductSlug(request.getProductSlug());
        lead.setSiteId(siteId);

        trialDownloadRepository.save(lead);

        // Tenant-scoped product lookup to prevent cross-brand data leaks
        Optional<Product> productOpt = productRepository.findBySlugAndSiteId(request.getProductSlug(), siteId);
        String secureDownloadUrl;
        if (productOpt.isPresent() && productOpt.get().getInstallerUrl() != null && !productOpt.get().getInstallerUrl().isBlank()) {
            secureDownloadUrl = productOpt.get().getInstallerUrl();
        } else {
            String filename = request.getProductSlug() + "-trial.exe";
            secureDownloadUrl = "https://downloads.thecrazyufo.in/installers/" + filename;
        }

        return ResponseEntity.ok(Map.of(
            "message", "Lead registered successfully! Starting your download...",
            "downloadUrl", secureDownloadUrl
        ));
    }
}
