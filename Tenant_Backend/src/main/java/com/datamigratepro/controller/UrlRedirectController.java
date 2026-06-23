package com.datamigratepro.controller;

import com.datamigratepro.entity.UrlRedirect;
import com.datamigratepro.repository.UrlRedirectRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping("/api/redirects")
public class UrlRedirectController {

    @Autowired
    private UrlRedirectRepository urlRedirectRepository;

    @GetMapping("/resolve")
    public ResponseEntity<?> resolveRedirect(@RequestParam String path, @RequestParam String siteId) {
        // Enforce leading slash for uniform matching
        String cleanPath = path;
        if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
        }
        
        Optional<UrlRedirect> redirect = urlRedirectRepository.findBySourcePathAndSiteId(cleanPath, siteId);
        if (redirect.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(redirect.get());
    }

    @GetMapping
    public ResponseEntity<Collection<UrlRedirect>> getAllRedirects(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(urlRedirectRepository.findBySiteId(siteId));
    }

    @PostMapping
    public ResponseEntity<UrlRedirect> saveRedirect(@RequestBody UrlRedirect redirect, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        redirect.setSiteId(siteId);
        UrlRedirect saved = urlRedirectRepository.save(redirect);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRedirect(@PathVariable Long id, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        if (urlRedirectRepository.existsById(id)) {
            urlRedirectRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
