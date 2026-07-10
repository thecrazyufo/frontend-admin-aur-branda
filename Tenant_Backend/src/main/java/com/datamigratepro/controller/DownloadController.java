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
    public ResponseEntity<Map<String, String>> registerTrialDownload(@Valid @RequestBody TrialDownloadRequest request) {
        TrialDownload lead = new TrialDownload();
        lead.setEmail(request.getEmail());
        lead.setProductSlug(request.getProductSlug());

        trialDownloadRepository.save(lead);

        // Get dynamic custom installer URL or generate default
        Optional<Product> productOpt = productRepository.findBySlug(request.getProductSlug());
        String secureDownloadUrl;
        if (productOpt.isPresent() && productOpt.get().getInstallerUrl() != null && !productOpt.get().getInstallerUrl().isBlank()) {
            secureDownloadUrl = productOpt.get().getInstallerUrl();
        } else {
            String filename = request.getProductSlug() + "-trial.exe";
            secureDownloadUrl = "https://downloads.datamigratepro.com/installers/" + filename;
        }

        return ResponseEntity.ok(Map.of(
            "message", "Lead registered successfully! Starting your download...",
            "downloadUrl", secureDownloadUrl
        ));
    }
}
