package com.datamigratepro.controller;

import com.datamigratepro.entity.Product;
import com.datamigratepro.repository.ProductRepository;
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

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(productRepository.findByCategoryAndSiteId(category, siteId));
        }

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(productRepository.findBySiteIdAndNameContainingIgnoreCaseOrSiteIdAndShortDescriptionContainingIgnoreCase(siteId, q, siteId, q));
        }

        return ResponseEntity.ok(productRepository.findBySiteId(siteId));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Product> getProductBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);
        
        Optional<Product> product = productRepository.findBySlugAndSiteId(slug, siteId);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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
                productRepository.findById(relatedId).ifPresent(relatedProducts::add);
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

        if (product.getId() == null || product.getId().isBlank()) {
            product.setId(UUID.randomUUID().toString());
        }
        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        Optional<Product> existing = productRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Check access for both the current siteId of the entity and the target siteId being set
        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (product.getSiteId() != null && !product.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(product.getSiteId());
        } else {
            product.setSiteId(existing.get().getSiteId());
        }

        product.setId(id);
        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        SecurityUtils.checkAccess(productOpt.get().getSiteId());

        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
