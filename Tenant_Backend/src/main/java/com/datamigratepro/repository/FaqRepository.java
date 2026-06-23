package com.datamigratepro.repository;

import com.datamigratepro.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, String> {
    List<Faq> findByCategory(String category);
    List<Faq> findBySiteId(String siteId);
    List<Faq> findByCategoryAndSiteId(String category, String siteId);
}
