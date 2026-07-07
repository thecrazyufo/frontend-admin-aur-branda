package com.datamigratepro.repository;

import com.datamigratepro.entity.CareerPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerPositionRepository extends JpaRepository<CareerPosition, String> {
    List<CareerPosition> findBySiteId(String siteId);
    List<CareerPosition> findBySiteIdAndStatus(String siteId, String status);
}
