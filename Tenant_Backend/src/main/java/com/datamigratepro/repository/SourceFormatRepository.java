package com.datamigratepro.repository;

import com.datamigratepro.entity.SourceFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SourceFormatRepository extends JpaRepository<SourceFormat, String> {
    List<SourceFormat> findBySiteId(String siteId);
}
