package com.datamigratepro.repository;

import com.datamigratepro.entity.UrlRedirect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRedirectRepository extends JpaRepository<UrlRedirect, Long> {
    Optional<UrlRedirect> findBySourcePathAndSiteId(String sourcePath, String siteId);
    List<UrlRedirect> findBySiteId(String siteId);
}
