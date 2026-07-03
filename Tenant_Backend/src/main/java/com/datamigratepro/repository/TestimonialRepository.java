package com.datamigratepro.repository;

import com.datamigratepro.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, String> {
    List<Testimonial> findBySiteIdOrderByCreatedAtDesc(String siteId);
    Optional<Testimonial> findByIdAndSiteId(String id, String siteId);
}
