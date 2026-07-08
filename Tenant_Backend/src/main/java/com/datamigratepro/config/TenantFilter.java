package com.datamigratepro.config;

import com.datamigratepro.config.UserCredentials;
import com.datamigratepro.security.SecurityUtils;
import com.datamigratepro.service.BrandConfigService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class TenantFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilter.class);

    @Autowired
    private BrandConfigService brandConfigService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        long startTime = System.currentTimeMillis();

        // 1. Extract or Generate Correlation ID
        String traceId = httpRequest.getHeader("X-Correlation-ID");
        if (traceId == null || traceId.isBlank()) {
            traceId = httpRequest.getHeader("X-Request-ID");
        }
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }

        // Set response header to propagate correlation ID back to the client
        httpResponse.setHeader("X-Correlation-ID", traceId);

        // 2. Setup MDC context
        MDC.put("traceId", traceId);

        String username = SecurityUtils.getCurrentUsername();
        MDC.put("userId", username != null ? username : "anonymous");

        // Central authentication, public brand listing, owner management, and error paths bypass siteId filters and resolve in the system context
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/refresh") || path.startsWith("/api/auth/logout") || path.startsWith("/api/auth/verify") || path.startsWith("/api/brands") || path.startsWith("/api/owner") || path.startsWith("/error")) {
            try {
                TenantContext.setCurrentTenant("system");
                MDC.put("siteId", "system");
                logger.info("Incoming request: {} {} (System Context)", method, path);
                chain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                logger.info("Response sent: {} {} - Status: {} - Duration: {}ms", method, path, httpResponse.getStatus(), duration);
                MDC.clear();
                TenantContext.clear();
            }
            return;
        }

        String tenantId = null;

        // 1. Check query parameters
        tenantId = httpRequest.getParameter("siteId");

        // 2. Check headers
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = httpRequest.getHeader("siteId");
        }
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = httpRequest.getHeader("X-Tenant-ID");
        }
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = httpRequest.getHeader("X-Brand-ID");
        }

        // 3. Check authenticated user context
        if (tenantId == null || tenantId.isBlank()) {
            UserCredentials user = SecurityUtils.getCurrentUser();
            if (user != null && !"OWNER".equalsIgnoreCase(user.role()) && !"SUPER_ADMIN".equalsIgnoreCase(user.role())) {
                tenantId = user.brandId();
            }
        }

        // 4. Validate against BrandConfigService
        if (tenantId == null || tenantId.isBlank()) {
            logger.warn("Request rejected: Missing siteId in request context for {} {}", method, path);
            httpResponse.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing siteId in request context");
            MDC.clear();
            return;
        }

        if (!"system".equals(tenantId) && !brandConfigService.isValidBrand(tenantId)) {
            logger.warn("Request rejected: Brand/Tenant '{}' not found or inactive for {} {}", tenantId, method, path);
            httpResponse.sendError(HttpServletResponse.SC_NOT_FOUND, "Brand/Tenant not found or inactive");
            MDC.clear();
            return;
        }

        MDC.put("siteId", tenantId);
        logger.info("Incoming request: {} {} - Tenant: {}", method, path, tenantId);

        try {
            TenantContext.setCurrentTenant(tenantId);
            chain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Exception handling request: {} {} - Error: {}", method, path, e.getMessage(), e);
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Response sent: {} {} - Status: {} - Tenant: {} - Duration: {}ms", method, path, httpResponse.getStatus(), tenantId, duration);
            MDC.clear();
            TenantContext.clear();
        }
    }
}
