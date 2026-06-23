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
}
