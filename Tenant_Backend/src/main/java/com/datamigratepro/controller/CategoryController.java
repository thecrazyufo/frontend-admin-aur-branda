package com.datamigratepro.controller;

import com.datamigratepro.entity.Category;
import com.datamigratepro.entity.Product;
import com.datamigratepro.repository.CategoryRepository;
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
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ PUBLIC GET
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        List<Category> allCategories = categoryRepository.findBySiteId(siteId);
        List<Product> products = productRepository.findBySiteId(siteId);
        Map<String, String> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));

        List<Category> filtered = new ArrayList<>();
        for (Category category : allCategories) {
            // Rule: Every Category entry must be associated with at least one Product/Tool
            if (category.getProductIds() != null && !category.getProductIds().isEmpty()) {
                List<String> names = new ArrayList<>();
                for (String pId : category.getProductIds()) {
                    if (productMap.containsKey(pId)) {
                        names.add(productMap.get(pId));
                    }
                }
                category.setProductNames(names);
                filtered.add(category);
            }
        }

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            SecurityUtils.checkAccess(category.getSiteId());
            
            List<String> names = new ArrayList<>();
            if (category.getProductIds() != null) {
                for (String pId : category.getProductIds()) {
                    productRepository.findById(pId).ifPresent(p -> names.add(p.getName()));
                }
            }
            category.setProductNames(names);
            
            return ResponseEntity.ok(category);
        }
        return ResponseEntity.notFound().build();
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        if (category.getSiteId() == null || category.getSiteId().isBlank()) {
            throw new IllegalArgumentException("Category siteId is required");
        }
        SecurityUtils.checkAccess(category.getSiteId());

        // Rule: Category must be associated with at least one Product/Tool
        if (category.getProductIds() == null || category.getProductIds().isEmpty()) {
            throw new IllegalArgumentException("Category must be associated with at least one Product/Tool");
        }

        if (category.getId() == null || category.getId().isBlank()) {
            category.setId(UUID.randomUUID().toString());
        }
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getLabel().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable String id, @RequestBody Category category) {
        Optional<Category> existing = categoryRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (category.getSiteId() != null && !category.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(category.getSiteId());
        } else {
            category.setSiteId(existing.get().getSiteId());
        }

        // Rule: Category must be associated with at least one Product/Tool
        if (category.getProductIds() == null || category.getProductIds().isEmpty()) {
            throw new IllegalArgumentException("Category must be associated with at least one Product/Tool");
        }

        category.setId(id);
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getLabel().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(categoryOpt.get().getSiteId());

        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
