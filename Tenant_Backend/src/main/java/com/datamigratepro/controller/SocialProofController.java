package com.datamigratepro.controller;

import com.datamigratepro.dto.ClientLogoDto;
import com.datamigratepro.dto.TestimonialDto;
import com.datamigratepro.entity.ClientLogo;
import com.datamigratepro.entity.Product;
import com.datamigratepro.entity.Testimonial;
import com.datamigratepro.repository.ClientLogoRepository;
import com.datamigratepro.repository.ProductRepository;
import com.datamigratepro.repository.TestimonialRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/social-proof")
public class SocialProofController {

    @Autowired
    private ClientLogoRepository clientLogoRepository;

    @Autowired
    private TestimonialRepository testimonialRepository;

    @Autowired
    private ProductRepository productRepository;

    // ─── Helper: resolve product names from product IDs ─────────────────────────
    private Map<String, String> buildProductNameMap(String siteId) {
        return productRepository.findBySiteId(siteId).stream()
                .collect(Collectors.toMap(Product::getId, Product::getName));
    }

    private void enrichProductNames(List<String> productIds, List<String> productNames, Map<String, String> nameMap) {
        if (productIds != null && !productIds.isEmpty()) {
            productIds.forEach(id -> {
                String name = nameMap.getOrDefault(id, id);
                if (!productNames.contains(name)) productNames.add(name);
            });
        }
    }

    // --- CLIENT LOGOS ---

    @GetMapping("/logos")
    public ResponseEntity<List<ClientLogo>> getLogos(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        List<ClientLogo> logos = clientLogoRepository.findBySiteIdOrderByDisplayOrderAsc(siteId);
        Map<String, String> nameMap = buildProductNameMap(siteId);
        logos.forEach(logo -> {
            List<String> names = new java.util.ArrayList<>();
            enrichProductNames(logo.getProductIds(), names, nameMap);
            logo.setProductNames(names);
        });
        return ResponseEntity.ok(logos);
    }

    @PostMapping("/logos")
    public ResponseEntity<ClientLogo> createLogo(@RequestParam String siteId, @RequestBody ClientLogoDto dto) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        ClientLogo logo = new ClientLogo();
        logo.setId(UUID.randomUUID().toString());
        logo.setSiteId(siteId);
        logo.setCompanyName(dto.getCompanyName());
        logo.setLogoUrl(dto.getLogoUrl());
        logo.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        logo.setDescription(dto.getDescription());
        logo.setCaseStudy(dto.getCaseStudy());
        logo.setProductIds(dto.getProductIds());
        return ResponseEntity.ok(clientLogoRepository.save(logo));
    }

    @PutMapping("/logos/{id}")
    public ResponseEntity<ClientLogo> updateLogo(@PathVariable String id, @RequestParam String siteId, @RequestBody ClientLogoDto dto) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        return clientLogoRepository.findByIdAndSiteId(id, siteId)
                .map(logo -> {
                    logo.setCompanyName(dto.getCompanyName());
                    logo.setLogoUrl(dto.getLogoUrl());
                    logo.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
                    logo.setDescription(dto.getDescription());
                    logo.setCaseStudy(dto.getCaseStudy());
                    logo.setProductIds(dto.getProductIds());
                    return ResponseEntity.ok(clientLogoRepository.save(logo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/logos/{id}")
    public ResponseEntity<Void> deleteLogo(@PathVariable String id, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        return clientLogoRepository.findByIdAndSiteId(id, siteId)
                .map(logo -> {
                    clientLogoRepository.delete(logo);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }


    // --- TESTIMONIALS ---

    @GetMapping("/testimonials")
    public ResponseEntity<List<Testimonial>> getTestimonials(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        List<Testimonial> testimonials = testimonialRepository.findBySiteIdOrderByCreatedAtDesc(siteId);
        Map<String, String> nameMap = buildProductNameMap(siteId);
        testimonials.forEach(t -> {
            List<String> names = new java.util.ArrayList<>();
            enrichProductNames(t.getProductIds(), names, nameMap);
            t.setProductNames(names);
        });
        return ResponseEntity.ok(testimonials);
    }

    @PostMapping("/testimonials")
    public ResponseEntity<Testimonial> createTestimonial(@RequestParam String siteId, @RequestBody TestimonialDto dto) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        Testimonial t = new Testimonial();
        t.setId(UUID.randomUUID().toString());
        t.setSiteId(siteId);
        t.setAuthorName(dto.getAuthorName());
        t.setAuthorTitle(dto.getAuthorTitle());
        t.setCompany(dto.getCompany());
        t.setContent(dto.getContent());
        t.setRating(dto.getRating() != null ? dto.getRating() : 5);
        t.setAvatarUrl(dto.getAvatarUrl());
        t.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        t.setProductIds(dto.getProductIds());
        return ResponseEntity.ok(testimonialRepository.save(t));
    }

    @PutMapping("/testimonials/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable String id, @RequestParam String siteId, @RequestBody TestimonialDto dto) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        return testimonialRepository.findByIdAndSiteId(id, siteId)
                .map(t -> {
                    t.setAuthorName(dto.getAuthorName());
                    t.setAuthorTitle(dto.getAuthorTitle());
                    t.setCompany(dto.getCompany());
                    t.setContent(dto.getContent());
                    t.setRating(dto.getRating() != null ? dto.getRating() : 5);
                    t.setAvatarUrl(dto.getAvatarUrl());
                    t.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
                    t.setProductIds(dto.getProductIds());
                    return ResponseEntity.ok(testimonialRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable String id, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        SecurityUtils.checkRole("ADMIN");
        return testimonialRepository.findByIdAndSiteId(id, siteId)
                .map(t -> {
                    testimonialRepository.delete(t);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
