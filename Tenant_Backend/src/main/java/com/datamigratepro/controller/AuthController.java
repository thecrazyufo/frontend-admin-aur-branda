package com.datamigratepro.controller;

import com.datamigratepro.config.TenantContext;
import com.datamigratepro.dto.LoginRequest;
import com.datamigratepro.dto.LoginResponse;
import com.datamigratepro.entity.AdminUser;
import com.datamigratepro.repository.AdminUserRepository;
import com.datamigratepro.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    // ─── Login ────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletResponse response) {
        String previousTenant = TenantContext.getCurrentTenant();
        Optional<AdminUser> adminUserOpt;
        try {
            TenantContext.setCurrentTenant("system");
            adminUserOpt = adminUserRepository.findById(request.username());
        } finally {
            restoreTenant(previousTenant);
        }

        if (adminUserOpt.isEmpty()) {
            return ResponseEntity.status(401).body("{\"error\": \"Invalid credentials\"}");
        }

        AdminUser user = adminUserOpt.get();

        // BCrypt comparison
        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPassword());

        if (!passwordMatches) {
            return ResponseEntity.status(401).body("{\"error\": \"Invalid credentials\"}");
        }

        String accessToken  = jwtTokenProvider.generateToken(request.username());
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.username());

        setRefreshCookie(response, refreshToken);

        return ResponseEntity.ok(new LoginResponse(
            accessToken,
            request.username(),
            expirationMs,
            user.getRole(),
            user.getBrandId()
        ));
    }

    // ─── Refresh ──────────────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request,
                                     HttpServletResponse response) {
        String refreshToken = extractRefreshCookie(request);

        if (refreshToken == null || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).body("{\"error\": \"Invalid or missing refresh token\"}");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);

        // Verify user still exists in systemdb
        String previousTenant = TenantContext.getCurrentTenant();
        Optional<AdminUser> userOpt;
        try {
            TenantContext.setCurrentTenant("system");
            userOpt = adminUserRepository.findById(username);
        } finally {
            restoreTenant(previousTenant);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("{\"error\": \"User no longer exists\"}");
        }

        AdminUser user = userOpt.get();
        String newAccessToken  = jwtTokenProvider.generateToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        // Rotate the refresh cookie
        setRefreshCookie(response, newRefreshToken);

        return ResponseEntity.ok(new LoginResponse(
            newAccessToken,
            username,
            expirationMs,
            user.getRole(),
            user.getBrandId()
        ));
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear the refresh cookie by setting Max-Age=0
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set to true in prod with HTTPS
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("{\"message\": \"Logged out successfully\"}");
    }

    // ─── Verify (existing) ────────────────────────────────────────────────────

    @GetMapping("/verify")
    public ResponseEntity<?> verify() {
        return ResponseEntity.ok("{\"valid\": true}");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set to true in prod with HTTPS
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge((int) (jwtTokenProvider.getRefreshExpirationMs() / 1000));
        response.addCookie(cookie);
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void restoreTenant(String previousTenant) {
        if (previousTenant != null) {
            TenantContext.setCurrentTenant(previousTenant);
        } else {
            TenantContext.clear();
        }
    }
}
