package com.datamigratepro.repository;

import com.datamigratepro.entity.TargetFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TargetFormatRepository extends JpaRepository<TargetFormat, String> {
    List<TargetFormat> findBySiteId(String siteId);
}
