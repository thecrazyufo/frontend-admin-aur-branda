package com.datamigratepro.controller;

import com.datamigratepro.entity.Faq;
import com.datamigratepro.repository.FaqRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

    @Autowired
    private FaqRepository faqRepository;

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<Faq>> getFaqs(
            @RequestParam(required = false) String category,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(faqRepository.findByCategoryAndSiteId(category, siteId));
        }
        return ResponseEntity.ok(faqRepository.findBySiteId(siteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Faq> getFaqById(@PathVariable String id) {
        Optional<Faq> faq = faqRepository.findById(id);
        if (faq.isPresent()) {
            SecurityUtils.checkAccess(faq.get().getSiteId());
            return ResponseEntity.ok(faq.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<Faq> createFaq(@RequestBody Faq faq) {
        if (faq.getSiteId() == null || faq.getSiteId().isBlank()) {
            throw new IllegalArgumentException("FAQ siteId is required");
        }
        SecurityUtils.checkAccess(faq.getSiteId());

        if (faq.getId() == null || faq.getId().isBlank()) {
            faq.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(faqRepository.save(faq));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Faq> updateFaq(@PathVariable String id, @RequestBody Faq faq) {
        Optional<Faq> existing = faqRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (faq.getSiteId() != null && !faq.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(faq.getSiteId());
        } else {
            faq.setSiteId(existing.get().getSiteId());
        }

        faq.setId(id);
        return ResponseEntity.ok(faqRepository.save(faq));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaq(@PathVariable String id) {
        Optional<Faq> faqOpt = faqRepository.findById(id);
        if (faqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(faqOpt.get().getSiteId());

        faqRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
