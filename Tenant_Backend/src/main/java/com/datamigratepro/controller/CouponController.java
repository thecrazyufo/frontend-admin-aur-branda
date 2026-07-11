package com.datamigratepro.controller;

import com.datamigratepro.entity.Coupon;
import com.datamigratepro.repository.CouponRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    // --- ADMIN CRUD ENDPOINTS

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(couponRepository.findBySiteId(siteId));
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        SecurityUtils.checkAccess(coupon.getSiteId());
        if (coupon.getId() == null || coupon.getId().isBlank()) {
            coupon.setId(UUID.randomUUID().toString());
        }
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable String id, @RequestBody Coupon coupon) {
        Optional<Coupon> existingOpt = couponRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Coupon existing = existingOpt.get();
        SecurityUtils.checkAccess(existing.getSiteId());

        existing.setActive(coupon.isActive());
        existing.setDiscountPercentage(coupon.getDiscountPercentage());
        existing.setExpiresAt(coupon.getExpiresAt());
        
        Coupon saved = couponRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable String id) {
        Optional<Coupon> existingOpt = couponRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Coupon existing = existingOpt.get();
        SecurityUtils.checkAccess(existing.getSiteId());

        couponRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    // --- PUBLIC VALIDAION ENDPOINT (For Storefront Checkout)

    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code, @RequestParam String siteId) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeAndSiteId(code.toUpperCase(), siteId);
        if (couponOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid coupon code."));
        }

        Coupon coupon = couponOpt.get();
        if (!coupon.isActive()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This coupon has been disabled."));
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This coupon has expired."));
        }

        return ResponseEntity.ok(coupon);
    }
}
