package com.datamigratepro.controller;

import com.datamigratepro.entity.BlogPost;
import com.datamigratepro.entity.Product;
import com.datamigratepro.repository.BlogPostRepository;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blog")
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private ProductRepository productRepository;

    private Map<String, String> buildProductNameMap(String siteId) {
        return productRepository.findBySiteId(siteId).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));
    }

    private void enrichProductNames(BlogPost post, Map<String, String> nameMap) {
        if (post.getProductIds() != null && !post.getProductIds().isEmpty()) {
            List<String> names = new ArrayList<>();
            post.getProductIds().forEach(id -> names.add(nameMap.getOrDefault(id, id)));
            post.setProductNames(names);
        }
    }

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<BlogPost>> getBlogPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);
        List<BlogPost> posts;
        if (category != null && !category.isBlank()) {
            posts = blogPostRepository.findByCategoryAndSiteId(category, siteId);
        } else {
            posts = blogPostRepository.findBySiteId(siteId);
        }
        Map<String, String> nameMap = buildProductNameMap(siteId);
        posts.forEach(p -> enrichProductNames(p, nameMap));
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPost> getBlogPostBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);
        Optional<BlogPost> post = blogPostRepository.findBySlugAndSiteId(slug, siteId);
        post.ifPresent(p -> {
            Map<String, String> nameMap = buildProductNameMap(siteId);
            enrichProductNames(p, nameMap);
        });
        return post.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔐 ADMIN-ONLY WRITE ENDPOINTS
    @PostMapping
    public ResponseEntity<BlogPost> createBlogPost(@RequestBody BlogPost blogPost) {
        if (blogPost.getSiteId() == null || blogPost.getSiteId().isBlank()) {
            throw new IllegalArgumentException("BlogPost siteId is required");
        }
        SecurityUtils.checkAccess(blogPost.getSiteId());

        if (blogPost.getId() == null || blogPost.getId().isBlank()) {
            blogPost.setId(UUID.randomUUID().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(blogPostRepository.save(blogPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPost> updateBlogPost(@PathVariable String id, @RequestBody BlogPost blogPost) {
        Optional<BlogPost> existing = blogPostRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(existing.get().getSiteId());
        if (blogPost.getSiteId() != null && !blogPost.getSiteId().isBlank()) {
            SecurityUtils.checkAccess(blogPost.getSiteId());
        } else {
            blogPost.setSiteId(existing.get().getSiteId());
        }

        blogPost.setId(id);
        return ResponseEntity.ok(blogPostRepository.save(blogPost));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable String id) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(postOpt.get().getSiteId());

        blogPostRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
