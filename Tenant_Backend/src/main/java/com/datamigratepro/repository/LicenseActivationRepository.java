package com.datamigratepro.repository;

import com.datamigratepro.entity.LicenseActivation;
import com.datamigratepro.entity.LicenseKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseActivationRepository extends JpaRepository<LicenseActivation, String> {
    Optional<LicenseActivation> findByLicenseKeyAndHardwareFingerprint(LicenseKey licenseKey, String hardwareFingerprint);
}
