package com.datamigratepro.controller;

import com.datamigratepro.config.TenantContext;
import com.datamigratepro.config.UserCredentials;
import com.datamigratepro.entity.AdminUser;
import com.datamigratepro.repository.AdminUserRepository;
import com.datamigratepro.service.BrandConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner/credentials")
public class OwnerController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private BrandConfigService brandConfigService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Collection<UserCredentials>> getCredentials() {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("system");
            Collection<UserCredentials> users = adminUserRepository.findAll().stream()
                    // Set password to empty string to avoid sensitive data exposure
                    .map(u -> new UserCredentials(u.getUsername(), "", u.getRole(), u.getBrandId(), u.getFullName(), u.getEmail()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    @PostMapping
    public ResponseEntity<UserCredentials> saveCredentials(@RequestBody UserCredentials request) {
        if (request.username() == null || request.username().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (request.role() == null || request.role().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        if (request.brandId() == null || request.brandId().isBlank()) {
            throw new IllegalArgumentException("Brand scope is required");
        }

        // Validate brand scope against BrandConfigService
        String brandScope = request.brandId().trim();
        if (!"all".equalsIgnoreCase(brandScope) && !brandConfigService.isValidBrand(brandScope)) {
            throw new IllegalArgumentException("Invalid brand scope: must be 'all' or a valid active brand ID");
        }

        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("system");
            Optional<AdminUser> existingOpt = adminUserRepository.findById(request.username().trim());
            
            String encodedPassword;
            if (existingOpt.isPresent()) {
                // Editing existing user
                if (request.password() == null || request.password().isBlank()) {
                    // Password not provided, keep the existing one
                    encodedPassword = existingOpt.get().getPassword();
                } else {
                    // Password provided, encode it
                    encodedPassword = passwordEncoder.encode(request.password().trim());
                }
            } else {
                // Creating new user
                if (request.password() == null || request.password().isBlank()) {
                    throw new IllegalArgumentException("Password is required for new accounts");
                }
                encodedPassword = passwordEncoder.encode(request.password().trim());
            }

            AdminUser user = new AdminUser(
                request.username().trim(),
                encodedPassword,
                request.role(),
                request.brandId(),
                request.fullName(),
                request.email()
            );
            adminUserRepository.save(user);
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }

        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Void> deleteCredentials(@PathVariable String username) {
        if ("owner".equalsIgnoreCase(username)) {
            throw new IllegalArgumentException("Cannot delete the root owner account");
        }

        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("system");
            if (adminUserRepository.existsById(username)) {
                adminUserRepository.deleteById(username);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }
}
