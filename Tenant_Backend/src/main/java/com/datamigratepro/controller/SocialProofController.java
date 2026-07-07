package com.datamigratepro.controller;

import com.datamigratepro.dto.ClientLogoDto;
import com.datamigratepro.dto.TestimonialDto;
import com.datamigratepro.entity.ClientLogo;
import com.datamigratepro.entity.Testimonial;
import com.datamigratepro.repository.ClientLogoRepository;
import com.datamigratepro.repository.TestimonialRepository;
import com.datamigratepro.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/social-proof")
public class SocialProofController {

    @Autowired
    private ClientLogoRepository clientLogoRepository;

    @Autowired
    private TestimonialRepository testimonialRepository;

    // --- CLIENT LOGOS ---

    @GetMapping("/logos")
    public ResponseEntity<List<ClientLogo>> getLogos(@RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return ResponseEntity.ok(clientLogoRepository.findBySiteIdOrderByDisplayOrderAsc(siteId));
    }

    @PostMapping("/logos")
    public ResponseEntity<ClientLogo> createLogo(@RequestParam String siteId, @RequestBody ClientLogoDto dto) {
        SecurityUtils.checkAccess(siteId);
        ClientLogo logo = new ClientLogo();
        logo.setId(UUID.randomUUID().toString());
        logo.setSiteId(siteId);
        logo.setCompanyName(dto.getCompanyName());
        logo.setLogoUrl(dto.getLogoUrl());
        logo.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        logo.setDescription(dto.getDescription());
        logo.setCaseStudy(dto.getCaseStudy());
        return ResponseEntity.ok(clientLogoRepository.save(logo));
    }

    @PutMapping("/logos/{id}")
    public ResponseEntity<ClientLogo> updateLogo(@PathVariable String id, @RequestParam String siteId, @RequestBody ClientLogoDto dto) {
        SecurityUtils.checkAccess(siteId);
        return clientLogoRepository.findByIdAndSiteId(id, siteId)
                .map(logo -> {
                    logo.setCompanyName(dto.getCompanyName());
                    logo.setLogoUrl(dto.getLogoUrl());
                    logo.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
                    logo.setDescription(dto.getDescription());
                    logo.setCaseStudy(dto.getCaseStudy());
                    return ResponseEntity.ok(clientLogoRepository.save(logo));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/logos/{id}")
    public ResponseEntity<Void> deleteLogo(@PathVariable String id, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
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
        return ResponseEntity.ok(testimonialRepository.findBySiteIdOrderByCreatedAtDesc(siteId));
    }

    @PostMapping("/testimonials")
    public ResponseEntity<Testimonial> createTestimonial(@RequestParam String siteId, @RequestBody TestimonialDto dto) {
        SecurityUtils.checkAccess(siteId);
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
        return ResponseEntity.ok(testimonialRepository.save(t));
    }

    @PutMapping("/testimonials/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable String id, @RequestParam String siteId, @RequestBody TestimonialDto dto) {
        SecurityUtils.checkAccess(siteId);
        return testimonialRepository.findByIdAndSiteId(id, siteId)
                .map(t -> {
                    t.setAuthorName(dto.getAuthorName());
                    t.setAuthorTitle(dto.getAuthorTitle());
                    t.setCompany(dto.getCompany());
                    t.setContent(dto.getContent());
                    t.setRating(dto.getRating() != null ? dto.getRating() : 5);
                    t.setAvatarUrl(dto.getAvatarUrl());
                    t.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
                    return ResponseEntity.ok(testimonialRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable String id, @RequestParam String siteId) {
        SecurityUtils.checkAccess(siteId);
        return testimonialRepository.findByIdAndSiteId(id, siteId)
                .map(t -> {
                    testimonialRepository.delete(t);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
