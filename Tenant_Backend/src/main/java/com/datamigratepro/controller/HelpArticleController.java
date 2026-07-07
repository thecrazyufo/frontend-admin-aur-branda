package com.datamigratepro.controller;

import com.datamigratepro.entity.HelpArticle;
import com.datamigratepro.repository.HelpArticleRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/help")
public class HelpArticleController {

    @Autowired
    private HelpArticleRepository helpArticleRepository;

    @GetMapping
    public ResponseEntity<List<HelpArticle>> getHelpArticles(
            @RequestParam(required = false) String q,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(helpArticleRepository.findBySiteIdAndTitleContainingIgnoreCaseOrSiteIdAndExcerptContainingIgnoreCase(siteId, q, siteId, q));
        }
        return ResponseEntity.ok(helpArticleRepository.findBySiteId(siteId));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<HelpArticle> getHelpArticleBySlug(
            @PathVariable String slug,
            @RequestParam(required = true) String siteId) {
        
        SecurityUtils.checkAccess(siteId);

        Optional<HelpArticle> article = helpArticleRepository.findBySlugAndSiteId(slug, siteId);
        return article.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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

        helpArticle.setId(id);
        if (helpArticle.getHelpful() == null) {
            helpArticle.setHelpful(existing.get().getHelpful());
        }
        if (helpArticle.getNotHelpful() == null) {
            helpArticle.setNotHelpful(existing.get().getNotHelpful());
        }
        return ResponseEntity.ok(helpArticleRepository.save(helpArticle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHelpArticle(@PathVariable String id) {
        Optional<HelpArticle> articleOpt = helpArticleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SecurityUtils.checkAccess(articleOpt.get().getSiteId());

        helpArticleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
