package com.datamigratepro.repository;

import com.datamigratepro.entity.SupportedClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportedClientRepository extends JpaRepository<SupportedClient, String> {
    List<SupportedClient> findBySiteId(String siteId);
}
