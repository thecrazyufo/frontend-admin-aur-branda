package com.datamigratepro.controller;

import com.datamigratepro.dto.ContactRequest;
import com.datamigratepro.entity.Inquiry;
import com.datamigratepro.repository.InquiryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @PostMapping("/contact")
    public ResponseEntity<Map<String, String>> submitContactForm(@Valid @RequestBody ContactRequest request) {
        Inquiry inquiry = new Inquiry();
        inquiry.setName(request.getName());
        inquiry.setEmail(request.getEmail());
        inquiry.setSubject(request.getSubject());
        inquiry.setMessage(request.getMessage());

        inquiryRepository.save(inquiry);

        return ResponseEntity.ok(Map.of("message", "Inquiry received successfully! Our support team will contact you shortly."));
    }
}
