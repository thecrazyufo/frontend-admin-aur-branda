package com.datamigratepro.repository;

import com.datamigratepro.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, String> {
    Optional<BlogPost> findBySlug(String slug);
    List<BlogPost> findByCategory(String category);
    List<BlogPost> findBySiteId(String siteId);
    Optional<BlogPost> findBySlugAndSiteId(String slug, String siteId);
    List<BlogPost> findByCategoryAndSiteId(String category, String siteId);
}
