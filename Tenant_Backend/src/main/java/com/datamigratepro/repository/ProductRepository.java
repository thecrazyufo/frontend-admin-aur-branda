package com.datamigratepro.repository;

import com.datamigratepro.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByCategory(String category);
    List<Product> findByNameContainingIgnoreCaseOrShortDescriptionContainingIgnoreCase(String name, String shortDescription);
    List<Product> findBySiteId(String siteId);
    Optional<Product> findBySlugAndSiteId(String slug, String siteId);
    List<Product> findByCategoryAndSiteId(String category, String siteId);
    List<Product> findBySiteIdAndNameContainingIgnoreCaseOrSiteIdAndShortDescriptionContainingIgnoreCase(String siteId1, String name, String siteId2, String shortDescription);
}
