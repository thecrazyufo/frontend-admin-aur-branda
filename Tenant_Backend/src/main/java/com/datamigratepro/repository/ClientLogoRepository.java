package com.datamigratepro.repository;

import com.datamigratepro.entity.ClientLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientLogoRepository extends JpaRepository<ClientLogo, String> {
    List<ClientLogo> findBySiteIdOrderByDisplayOrderAsc(String siteId);
    Optional<ClientLogo> findByIdAndSiteId(String id, String siteId);
}
