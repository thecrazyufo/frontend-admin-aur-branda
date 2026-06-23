package com.datamigratepro.repository;

import com.datamigratepro.entity.Activation;
import com.datamigratepro.entity.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivationRepository extends JpaRepository<Activation, Integer> {
    Optional<Activation> findByLicenseAndMachineId(License license, String machineId);
}
