package com.datamigratepro.repository;

import com.datamigratepro.entity.BrandConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandConfigRepository extends JpaRepository<BrandConfig, String> {
    Optional<BrandConfig> findByDomain(String domain);
}
