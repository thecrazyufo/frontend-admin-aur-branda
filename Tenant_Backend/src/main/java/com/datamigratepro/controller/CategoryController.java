package com.datamigratepro.controller;

import com.datamigratepro.entity.Category;
import com.datamigratepro.repository.CategoryRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // ✅ PUBLIC GET
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        return ResponseEntity.ok(categoryRepository.findBySiteId(siteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            SecurityUtils.checkAccess(category.get().getSiteId());
            return ResponseEntity.ok(category.get());
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

        if (category.getId() == null || category.getId().isBlank()) {
            category.setId(UUID.randomUUID().toString());
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

        category.setId(id);
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
