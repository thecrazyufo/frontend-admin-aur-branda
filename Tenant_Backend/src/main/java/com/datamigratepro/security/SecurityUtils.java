package com.datamigratepro.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import com.datamigratepro.config.UserCredentials;
import com.datamigratepro.config.TenantContext;
import com.datamigratepro.config.ApplicationContextHolder;
import com.datamigratepro.repository.AdminUserRepository;

public class SecurityUtils {

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    public static UserCredentials getCurrentUser() {
        String username = getCurrentUsername();
        if (username == null) return null;

        AdminUserRepository repo = ApplicationContextHolder.getBean(AdminUserRepository.class);
        if (repo == null) return null;

        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("system");
            return repo.findById(username)
                    .map(u -> new UserCredentials(u.getUsername(), u.getPassword(), u.getRole(), u.getBrandId(), u.getFullName(), u.getEmail()))
                    .orElse(null);
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    public static void checkAccess(String requestSiteId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // Unauthenticated public request (storefront fetching catalog, etc.)
            return;
        }

        UserCredentials user = getCurrentUser();
        if (user == null) {
            throw new AccessDeniedException("Access Denied: Unrecognized administrator");
        }

        // Global admin (SUPER_ADMIN or legacy OWNER) has access to everything
        String role = user.role();
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "OWNER".equalsIgnoreCase(role)) {
            return;
        }

        // Non-owner is isolated strictly to their assigned brandId
        if (requestSiteId == null || !requestSiteId.equalsIgnoreCase(user.brandId())) {
            throw new AccessDeniedException("Access Denied: You do not have permissions to manage brand: " + requestSiteId);
        }
    }
}
