package com.datamigratepro.controller;

import com.datamigratepro.entity.Faq;
import com.datamigratepro.entity.Product;
import com.datamigratepro.repository.FaqRepository;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<Faq>> getFaqs(
            @RequestParam(required = false) String category,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        List<Faq> faqs;
        if (category != null && !category.isBlank()) {
            faqs = faqRepository.findByCategoryAndSiteId(category, siteId);
        } else {
            faqs = faqRepository.findBySiteId(siteId);
        }

        // Fetch products and map names to populate transient properties
        List<Product> products = productRepository.findBySiteId(siteId);
        Map<String, String> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));

        List<Faq> filtered = new ArrayList<>();
        for (Faq faq : faqs) {
            // Rule: Every FAQ entry must be associated with at least one Product/Tool
            boolean hasProduct = (faq.getProductIds() != null && !faq.getProductIds().isEmpty()) || (faq.getProductId() != null && !faq.getProductId().isBlank());
            if (hasProduct) {
                List<String> names = new ArrayList<>();
                if (faq.getProductIds() != null && !faq.getProductIds().isEmpty()) {
                    for (String pId : faq.getProductIds()) {
                        if (productMap.containsKey(pId)) {
                            names.add(productMap.get(pId));
                        }
                    }
                } else if (faq.getProductId() != null && productMap.containsKey(faq.getProductId())) {
                    names.add(productMap.get(faq.getProductId()));
                }
                faq.setProductNames(names);
                if (!names.isEmpty()) {
                    faq.setProductName(names.get(0));
                }
                filtered.add(faq);
            }
        }

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Faq> getFaqById(@PathVariable String id) {
        Optional<Faq> faqOpt = faqRepository.findById(id);
        if (faqOpt.isPresent()) {
            Faq faq = faqOpt.get();
            SecurityUtils.checkAccess(faq.getSiteId());
            
            List<String> names = new ArrayList<>();
            if (faq.getProductIds() != null && !faq.getProductIds().isEmpty()) {
                for (String pId : faq.getProductIds()) {
                    productRepository.findById(pId).ifPresent(p -> names.add(p.getName()));
                }
            } else if (faq.getProductId() != null) {
                productRepository.findById(faq.getProductId()).ifPresent(p -> names.add(p.getName()));
            }
            faq.setProductNames(names);
            if (!names.isEmpty()) {
                faq.setProductName(names.get(0));
            }
            
            return ResponseEntity.ok(faq);
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

        // Rule: FAQ must be associated with at least one Product/Tool
        boolean hasProduct = (faq.getProductIds() != null && !faq.getProductIds().isEmpty()) || (faq.getProductId() != null && !faq.getProductId().isBlank());
        if (!hasProduct) {
            throw new IllegalArgumentException("FAQ must be associated with at least one Product/Tool");
        }

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

        // Rule: FAQ must be associated with at least one Product/Tool
        boolean hasProduct = (faq.getProductIds() != null && !faq.getProductIds().isEmpty()) || (faq.getProductId() != null && !faq.getProductId().isBlank());
        if (!hasProduct) {
            throw new IllegalArgumentException("FAQ must be associated with at least one Product/Tool");
        }

        faq.setId(id);
        
        // Preserve fields if not passed in PUT payload
        if (faq.getProductId() == null) {
            faq.setProductId(existing.get().getProductId());
        }
        if (faq.getProductIds() == null) {
            faq.setProductIds(existing.get().getProductIds());
        }

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
