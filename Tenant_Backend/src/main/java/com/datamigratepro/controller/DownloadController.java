package com.datamigratepro.controller;

import com.datamigratepro.dto.TrialDownloadRequest;
import com.datamigratepro.entity.TrialDownload;
import com.datamigratepro.repository.TrialDownloadRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/download")
public class DownloadController {

    @Autowired
    private TrialDownloadRepository trialDownloadRepository;

    @PostMapping("/trial")
    public ResponseEntity<Map<String, String>> registerTrialDownload(@Valid @RequestBody TrialDownloadRequest request) {
        TrialDownload lead = new TrialDownload();
        lead.setEmail(request.getEmail());
        lead.setProductSlug(request.getProductSlug());

        trialDownloadRepository.save(lead);

        // Generate simulated dynamic download URL
        String filename = request.getProductSlug() + "-trial.exe";
        String secureDownloadUrl = "https://downloads.datamigratepro.com/installers/" + filename;

        return ResponseEntity.ok(Map.of(
            "message", "Lead registered successfully! Starting your download...",
            "downloadUrl", secureDownloadUrl
        ));
    }
}
