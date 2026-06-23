package com.datamigratepro.repository;

import com.datamigratepro.entity.TrialDownload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrialDownloadRepository extends JpaRepository<TrialDownload, Long> {
}
