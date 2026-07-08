package com.datamigratepro.controller;

import com.datamigratepro.entity.*;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.repository.FaqRepository;
import com.datamigratepro.repository.HelpArticleRepository;
import com.datamigratepro.service.ProductIdGeneratorService;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private HelpArticleRepository helpArticleRepository;

    @Autowired
    private ProductIdGeneratorService productIdGeneratorService;

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        List<Product> products;
        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndSiteId(category, siteId);
        } else if (q != null && !q.isBlank()) {
            products = productRepository.findBySiteIdAndNameContainingIgnoreCaseOrSiteIdAndShortDescriptionContainingIgnoreCase(siteId, q, siteId, q);
        } else {
            products = productRepository.findBySiteId(siteId);
        }

        for (Product product : products) {
            populateProductFaqsAndGuides(product);
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Product> getProductBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);
        
        Optional<Product> productOpt = productRepository.findBySlugAndSiteId(slug, siteId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            populateProductFaqsAndGuides(product);
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelatedProducts(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product product = productOpt.get();
        SecurityUtils.checkAccess(product.getSiteId());

        List<String> relatedIds = product.getRelatedProductIds();
        List<Product> relatedProducts = new ArrayList<>();

        if (relatedIds != null) {
            for (String relatedId : relatedIds) {
                productRepository.findById(relatedId).ifPresent(p -> {
                    populateProductFaqsAndGuides(p);
                    relatedProducts.add(p);
                });
            }
        }

        return ResponseEntity.ok(relatedProducts);
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getSiteId() == null || product.getSiteId().isBlank()) {
            throw new IllegalArgumentException("Product siteId is required");
        }
        SecurityUtils.checkAccess(product.getSiteId());

        if (product.getId() == null || product.getId().isBlank() || !product.getId().startsWith("PRM-")) {
            String newId = productIdGeneratorService.generateProductId(product.getCategory());
            product.setId(newId);
        }
        
        syncProductFaqsAndGuides(product);
        
        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Optional<Product> existing = productRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (product.getSiteId() != null && !product.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(product.getSiteId());
        } else {
            product.setSiteId(existing.get().getSiteId());
        }

        product.setId(id);
        syncProductFaqsAndGuides(product);
        
        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        String siteId = productOpt.get().getSiteId();
        SecurityUtils.checkAccess(siteId);

        // Safe cleanup for linked FAQs
        List<Faq> siteFaqs = faqRepository.findBySiteId(siteId);
        for (Faq f : siteFaqs) {
            if (f.getProductIds() != null && f.getProductIds().contains(id)) {
                if (f.getProductIds().size() <= 1) {
                    faqRepository.delete(f);
                } else {
                    f.getProductIds().remove(id);
                    faqRepository.save(f);
                }
            } else if (id.equals(f.getProductId())) {
                faqRepository.delete(f);
            }
        }

        // Safe cleanup for linked guides
        List<HelpArticle> siteGuides = helpArticleRepository.findBySiteId(siteId);
        for (HelpArticle g : siteGuides) {
            if (g.getProductIds() != null && g.getProductIds().contains(id)) {
                if (g.getProductIds().size() <= 1) {
                    helpArticleRepository.delete(g);
                } else {
                    g.getProductIds().remove(id);
                    helpArticleRepository.save(g);
                }
            } else if (id.equals(g.getProductId())) {
                helpArticleRepository.delete(g);
            }
        }

        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Helper Sync & Populate Methods ───────────────────────────────────────

    private void populateProductFaqsAndGuides(Product product) {
        if (product == null) return;
        
        // 1. Fetch and set FAQs using safe in-memory filtering
        List<Faq> siteFaqs = faqRepository.findBySiteId(product.getSiteId());
        List<ProductFaq> pFaqs = new ArrayList<>();
        for (Faq f : siteFaqs) {
            boolean isLinked = product.getId().equals(f.getProductId()) || (f.getProductIds() != null && f.getProductIds().contains(product.getId()));
            if (isLinked) {
                pFaqs.add(new ProductFaq(f.getQuestion(), f.getAnswer()));
            }
        }
        product.setFaqs(pFaqs);

        // 2. Fetch and parse Guides using safe in-memory filtering
        List<HelpArticle> siteGuides = helpArticleRepository.findBySiteId(product.getSiteId());
        List<HowItWorksStep> pSteps = new ArrayList<>();
        for (HelpArticle guide : siteGuides) {
            boolean isLinked = product.getId().equals(guide.getProductId()) || (guide.getProductIds() != null && guide.getProductIds().contains(product.getId()));
            if (isLinked) {
                String content = guide.getContent();
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
                            pSteps.add(new HowItWorksStep(stepNum++, header, body, "arrow-right"));
                        }
                    }
                }
                break; // Use the first matching user guide
            }
        }
        product.setHowItWorks(pSteps);
    }

    private void syncProductFaqsAndGuides(Product product) {
        String productId = product.getId();
        String siteId = product.getSiteId();

        // 1. Sync FAQs to the faqs table
        List<Faq> oldFaqs = faqRepository.findByProductId(productId);
        faqRepository.deleteAll(oldFaqs);
        if (product.getFaqs() != null) {
            for (ProductFaq pFaq : product.getFaqs()) {
                Faq faq = new Faq();
                faq.setId(UUID.randomUUID().toString());
                faq.setQuestion(pFaq.getQuestion());
                faq.setAnswer(pFaq.getAnswer());
                faq.setCategory("Product: " + product.getName());
                faq.setSiteId(siteId);
                faq.setProductId(productId);
                faq.setProductIds(List.of(productId));
                faqRepository.save(faq);
            }
        }

        // 2. Sync dynamic user guide to the help_articles table
        List<HelpArticle> oldGuides = helpArticleRepository.findByProductId(productId);
        helpArticleRepository.deleteAll(oldGuides);
        if (product.getHowItWorks() != null && !product.getHowItWorks().isEmpty()) {
            HelpArticle guide = new HelpArticle();
            guide.setId(UUID.randomUUID().toString());
            guide.setSlug(product.getSlug() + "-user-guide");
            guide.setTitle("User Guide: How to Use " + product.getName());
            guide.setExcerpt("Step-by-step configuration and usage guide for " + product.getName() + ".");

            StringBuilder sb = new StringBuilder();
            for (HowItWorksStep step : product.getHowItWorks()) {
                sb.append("### ").append(step.getStep()).append(". ").append(step.getTitle()).append("\n");
                sb.append(step.getDescription()).append("\n\n");
            }
            guide.setContent(sb.toString().trim());
            guide.setCategory("Product Guide");
            guide.setTags(List.of("guide", "product", product.getName().toLowerCase()));
            guide.setPublishedAt(product.getLastUpdated() != null ? product.getLastUpdated() : "2026-07-07");
            guide.setHelpful(0);
            guide.setNotHelpful(0);
            guide.setSiteId(siteId);
            guide.setProductId(productId);
            guide.setProductIds(List.of(productId));
            helpArticleRepository.save(guide);
        }
    }
}
