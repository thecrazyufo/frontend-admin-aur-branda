package com.datamigratepro.repository;

import com.datamigratepro.entity.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, Integer> {
    Optional<License> findByLicenseKey(String licenseKey);
    java.util.List<License> findBySiteId(String siteId);
}
