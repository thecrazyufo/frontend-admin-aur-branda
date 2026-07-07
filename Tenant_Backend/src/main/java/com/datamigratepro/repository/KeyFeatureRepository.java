package com.datamigratepro.repository;

import com.datamigratepro.entity.KeyFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KeyFeatureRepository extends JpaRepository<KeyFeature, String> {
    List<KeyFeature> findBySiteId(String siteId);
}
