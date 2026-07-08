package com.datamigratepro.controller;

import com.datamigratepro.entity.HelpArticle;
import com.datamigratepro.entity.Product;
import com.datamigratepro.entity.HowItWorksStep;
import com.datamigratepro.repository.HelpArticleRepository;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/help")
public class HelpArticleController {

    @Autowired
    private HelpArticleRepository helpArticleRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<HelpArticle>> getHelpArticles(
            @RequestParam(required = false) String q,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        List<HelpArticle> articles;
        if (q != null && !q.isBlank()) {
            articles = helpArticleRepository.findBySiteIdAndTitleContainingIgnoreCaseOrSiteIdAndExcerptContainingIgnoreCase(siteId, q, siteId, q);
        } else {
            articles = helpArticleRepository.findBySiteId(siteId);
        }

        // Populate transient properties
        List<Product> products = productRepository.findBySiteId(siteId);
        Map<String, String> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));

        List<HelpArticle> filtered = new ArrayList<>();
        for (HelpArticle article : articles) {
            // Rule: Every Guide entry must be associated with at least one Product/Tool
            boolean hasProduct = (article.getProductIds() != null && !article.getProductIds().isEmpty()) || (article.getProductId() != null && !article.getProductId().isBlank());
            if (hasProduct) {
                List<String> names = new ArrayList<>();
                if (article.getProductIds() != null && !article.getProductIds().isEmpty()) {
                    for (String pId : article.getProductIds()) {
                        if (productMap.containsKey(pId)) {
                            names.add(productMap.get(pId));
                        }
                    }
                } else if (article.getProductId() != null && productMap.containsKey(article.getProductId())) {
                    names.add(productMap.get(article.getProductId()));
                }
                article.setProductNames(names);
                if (!names.isEmpty()) {
                    article.setProductName(names.get(0));
                }
                filtered.add(article);
            }
        }

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<HelpArticle> getHelpArticleBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        Optional<HelpArticle> articleOpt = helpArticleRepository.findBySlugAndSiteId(slug, siteId);
        if (articleOpt.isPresent()) {
            HelpArticle article = articleOpt.get();
            List<String> names = new ArrayList<>();
            if (article.getProductIds() != null && !article.getProductIds().isEmpty()) {
                for (String pId : article.getProductIds()) {
                    productRepository.findById(pId).ifPresent(p -> names.add(p.getName()));
                }
            } else if (article.getProductId() != null) {
                productRepository.findById(article.getProductId()).ifPresent(p -> names.add(p.getName()));
            }
            article.setProductNames(names);
            if (!names.isEmpty()) {
                article.setProductName(names.get(0));
            }
            return ResponseEntity.ok(article);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<Map<String, Integer>> markHelpful(@PathVariable String id) {
        Optional<HelpArticle> articleOpt = helpArticleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HelpArticle article = articleOpt.get();
        SecurityUtils.checkAccess(article.getSiteId());

        article.setHelpful(article.getHelpful() + 1);
        helpArticleRepository.save(article);

        return ResponseEntity.ok(Map.of("helpful", article.getHelpful()));
    }

    @PostMapping("/{id}/nothelpful")
    public ResponseEntity<Map<String, Integer>> markNotHelpful(@PathVariable String id) {
        Optional<HelpArticle> articleOpt = helpArticleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HelpArticle article = articleOpt.get();
        SecurityUtils.checkAccess(article.getSiteId());

        article.setNotHelpful(article.getNotHelpful() + 1);
        helpArticleRepository.save(article);

        return ResponseEntity.ok(Map.of("notHelpful", article.getNotHelpful()));
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<HelpArticle> createHelpArticle(@RequestBody HelpArticle helpArticle) {
        if (helpArticle.getSiteId() == null || helpArticle.getSiteId().isBlank()) {
            throw new IllegalArgumentException("HelpArticle siteId is required");
        }
        SecurityUtils.checkAccess(helpArticle.getSiteId());

        // Rule: Guide must be associated with at least one Product/Tool
        boolean hasProduct = (helpArticle.getProductIds() != null && !helpArticle.getProductIds().isEmpty()) || (helpArticle.getProductId() != null && !helpArticle.getProductId().isBlank());
        if (!hasProduct) {
            throw new IllegalArgumentException("Guide must be associated with at least one Product/Tool");
        }

        if (helpArticle.getId() == null || helpArticle.getId().isBlank()) {
            helpArticle.setId(java.util.UUID.randomUUID().toString());
        }
        if (helpArticle.getHelpful() == null) {
            helpArticle.setHelpful(0);
        }
        if (helpArticle.getNotHelpful() == null) {
            helpArticle.setNotHelpful(0);
        }
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(helpArticleRepository.save(helpArticle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HelpArticle> updateHelpArticle(@PathVariable String id, @RequestBody HelpArticle helpArticle) {
        Optional<HelpArticle> existing = helpArticleRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (helpArticle.getSiteId() != null && !helpArticle.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(helpArticle.getSiteId());
        } else {
            helpArticle.setSiteId(existing.get().getSiteId());
        }

        // Rule: Guide must be associated with at least one Product/Tool
        boolean hasProduct = (helpArticle.getProductIds() != null && !helpArticle.getProductIds().isEmpty()) || (helpArticle.getProductId() != null && !helpArticle.getProductId().isBlank());
        if (!hasProduct) {
            throw new IllegalArgumentException("Guide must be associated with at least one Product/Tool");
        }

        helpArticle.setId(id);
        if (helpArticle.getHelpful() == null) {
            helpArticle.setHelpful(existing.get().getHelpful());
        }
        if (helpArticle.getNotHelpful() == null) {
            helpArticle.setNotHelpful(existing.get().getNotHelpful());
        }

        // Preserve fields if not passed
        if (helpArticle.getProductId() == null) {
            helpArticle.setProductId(existing.get().getProductId());
        }
        if (helpArticle.getProductIds() == null) {
            helpArticle.setProductIds(existing.get().getProductIds());
        }

        // Bi-directional sync back to all linked products' howItWorks lists
        List<String> targetProductIds = new ArrayList<>();
        if (helpArticle.getProductIds() != null && !helpArticle.getProductIds().isEmpty()) {
            targetProductIds.addAll(helpArticle.getProductIds());
        } else if (helpArticle.getProductId() != null) {
            targetProductIds.add(helpArticle.getProductId());
        }

        for (String pId : targetProductIds) {
            Optional<Product> productOpt = productRepository.findById(pId);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                List<HowItWorksStep> steps = new ArrayList<>();
                String content = helpArticle.getContent();
                if (content != null && !content.isBlank()) {
                    String[] sections = content.split("(?s)(?=### \\d+\\.)");
                    int stepNum = 1;
                    for (String section : sections) {
                        section = section.trim();
                        if (section.isEmpty()) continue;
                        String[] lines = section.split("\n", 2);
                        if (lines.length > 0) {
                            String header = lines[0].replaceFirst("### \\d+\\.", "").trim();
                            String body = lines.length > 1 ? lines[1].trim() : "";
                            steps.add(new HowItWorksStep(stepNum++, header, body, "arrow-right"));
                        }
                    }
                }
                product.setHowItWorks(steps);
                productRepository.save(product);
            }
        }

        return ResponseEntity.ok(helpArticleRepository.save(helpArticle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHelpArticle(@PathVariable String id) {
        Optional<HelpArticle> articleOpt = helpArticleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HelpArticle article = articleOpt.get();
        SecurityUtils.checkAccess(article.getSiteId());

        // Clear howItWorks list on all linked products
        List<String> targetProductIds = new ArrayList<>();
        if (article.getProductIds() != null && !article.getProductIds().isEmpty()) {
            targetProductIds.addAll(article.getProductIds());
        } else if (article.getProductId() != null) {
            targetProductIds.add(article.getProductId());
        }

        for (String pId : targetProductIds) {
            productRepository.findById(pId).ifPresent(p -> {
                p.setHowItWorks(new ArrayList<>());
                productRepository.save(p);
            });
        }

        helpArticleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
