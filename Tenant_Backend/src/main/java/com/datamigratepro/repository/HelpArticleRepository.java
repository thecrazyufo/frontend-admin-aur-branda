package com.datamigratepro.repository;

import com.datamigratepro.entity.HelpArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpArticleRepository extends JpaRepository<HelpArticle, String> {
    Optional<HelpArticle> findBySlug(String slug);
    List<HelpArticle> findByTitleContainingIgnoreCaseOrExcerptContainingIgnoreCase(String title, String excerpt);
    List<HelpArticle> findBySiteId(String siteId);
    Optional<HelpArticle> findBySlugAndSiteId(String slug, String siteId);
    List<HelpArticle> findBySiteIdAndTitleContainingIgnoreCaseOrSiteIdAndExcerptContainingIgnoreCase(String siteId1, String title, String siteId2, String excerpt);
    List<HelpArticle> findByProductId(String productId);
    Optional<HelpArticle> findByProductIdAndSiteId(String productId, String siteId);
}
