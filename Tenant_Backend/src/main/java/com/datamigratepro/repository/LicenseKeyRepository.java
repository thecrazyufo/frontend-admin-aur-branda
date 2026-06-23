package com.datamigratepro.repository;

import com.datamigratepro.entity.LicenseKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseKeyRepository extends JpaRepository<LicenseKey, String> {
    Optional<LicenseKey> findByActivationKey(String activationKey);
    Optional<LicenseKey> findByActivationKeyAndOrderId(String activationKey, String orderId);
    java.util.List<LicenseKey> findBySiteId(String siteId);
}
