package com.datamigratepro.repository;

import com.datamigratepro.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String> {
    List<Coupon> findBySiteId(String siteId);
    Optional<Coupon> findByCodeAndSiteId(String code, String siteId);
}
