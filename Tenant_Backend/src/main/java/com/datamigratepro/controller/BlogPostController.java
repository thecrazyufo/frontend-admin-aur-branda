package com.datamigratepro.controller;

import com.datamigratepro.entity.BlogPost;
import com.datamigratepro.repository.BlogPostRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/blog")
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    // ✅ PUBLIC GET ENDPOINTS
    @GetMapping
    public ResponseEntity<List<BlogPost>> getBlogPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(blogPostRepository.findByCategoryAndSiteId(category, siteId));
        }
        return ResponseEntity.ok(blogPostRepository.findBySiteId(siteId));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPost> getBlogPostBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        Optional<BlogPost> post = blogPostRepository.findBySlugAndSiteId(slug, siteId);
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
