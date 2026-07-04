package com.datamigratepro.security;

import com.datamigratepro.config.TenantFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${app.cors.allowed-origin-patterns}")
    private List<String> allowedOriginPatterns;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private TenantFilter tenantFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ✅ Public — Auth, refresh, logout, and License validation endpoints
                .requestMatchers("/api/auth/login", "/api/auth/verify", "/error").permitAll()
                .requestMatchers("/api/auth/refresh", "/api/auth/logout").permitAll()
                .requestMatchers("/api/licenses/validate").permitAll()
                .requestMatchers("/api/license/activate").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                .requestMatchers("/api/checkout/**").permitAll()

                // ═══════════════════════════════════════════════════════════════
                // NEW RBAC MODEL
                // Roles: SUPER_ADMIN, ADMIN, SEO_CW_PRODUCT_MANAGER
                // Legacy roles (OWNER, BRAND_MANAGER, PRODUCT_MANAGER, CONTENT_SEO_MANAGER, SEO, WRITER, LICENSE_ADMIN) are accepted
                // ═══════════════════════════════════════════════════════════════

                // 🔐 Super Admin / Owner — User & Credential Management
                .requestMatchers("/api/owner/**").hasAnyRole("SUPER_ADMIN", "OWNER")

                // 🔐 License Management — Super Admin or Brand Admin
                .requestMatchers("/api/licensing-admin", "/api/licensing-admin/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "LICENSE_ADMIN")

                // 🔐 Brand Settings mutations (PUT, PATCH) — Super Admin or Brand Admin
                .requestMatchers(HttpMethod.PUT, "/api/settings", "/api/settings/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "BRAND_MANAGER", "SEO")
                .requestMatchers(HttpMethod.PATCH, "/api/settings", "/api/settings/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "BRAND_MANAGER", "SEO")
                .requestMatchers(HttpMethod.POST, "/api/settings", "/api/settings/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "BRAND_MANAGER", "SEO")
                .requestMatchers(HttpMethod.DELETE, "/api/settings", "/api/settings/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "BRAND_MANAGER", "SEO")

                // 🔐 Product mutations — Super Admin or SEO/CW & Product Manager
                .requestMatchers(HttpMethod.POST, "/api/products", "/api/products/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "SEO", "WRITER")
                .requestMatchers(HttpMethod.PUT, "/api/products", "/api/products/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "SEO", "WRITER")
                .requestMatchers(HttpMethod.DELETE, "/api/products", "/api/products/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "SEO", "WRITER")

                // 🔐 Category mutations
                .requestMatchers(HttpMethod.POST, "/api/categories", "/api/categories/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")
                .requestMatchers(HttpMethod.PUT, "/api/categories", "/api/categories/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")
                .requestMatchers(HttpMethod.DELETE, "/api/categories", "/api/categories/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")

                // 🔐 Content mutations (blogs, faqs, help, social proof)
                .requestMatchers(HttpMethod.POST, "/api/blog", "/api/blog/**", "/api/faqs", "/api/faqs/**", "/api/help", "/api/help/**", "/api/social-proof", "/api/social-proof/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")
                .requestMatchers(HttpMethod.PUT, "/api/blog", "/api/blog/**", "/api/faqs", "/api/faqs/**", "/api/help", "/api/help/**", "/api/social-proof", "/api/social-proof/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")
                .requestMatchers(HttpMethod.DELETE, "/api/blog", "/api/blog/**", "/api/faqs", "/api/faqs/**", "/api/help", "/api/help/**", "/api/social-proof", "/api/social-proof/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "WRITER")

                // 🔐 File upload
                .requestMatchers(HttpMethod.POST, "/api/upload", "/api/upload/**")
                    .hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN", "SEO_CW_PRODUCT_MANAGER", "PRODUCT_MANAGER", "CONTENT_SEO_MANAGER", "BRAND_MANAGER", "WRITER", "SEO")

                // 🔐 URL Redirect mutations (admin panel)
                .requestMatchers(HttpMethod.GET, "/api/redirects").hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/redirects").hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/redirects/**").hasAnyRole("SUPER_ADMIN", "OWNER", "ADMIN")

                // ✅ Public GET endpoints (browsing the storefront)
                .requestMatchers(HttpMethod.GET,
                    "/api/settings", "/api/settings/**",
                    "/api/social-proof", "/api/social-proof/**",
                    "/api/brands", "/api/brands/**",
                    "/api/products", "/api/products/**",
                    "/api/blog", "/api/blog/**",
                    "/api/faqs", "/api/faqs/**",
                    "/api/categories", "/api/categories/**",
                    "/api/help", "/api/help/**",
                    "/api/redirects/resolve",
                    // ✅ Find Your Tool — public storefront endpoints
                    "/api/tools/match",
                    "/api/tools/capabilities",
                    "/api/formats/available"
                ).permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(tenantFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
