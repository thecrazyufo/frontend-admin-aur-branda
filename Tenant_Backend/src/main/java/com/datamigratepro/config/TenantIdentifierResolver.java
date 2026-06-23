package com.datamigratepro.config;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver, HibernatePropertiesCustomizer {

    @Override
    public String resolveCurrentTenantIdentifier() {
        String tenant = TenantContext.getCurrentTenant();
        // Fallback to "brandA" during bootstrap/validation phase
        return tenant != null ? tenant : "brandA";
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        // Register the resolver bean with Hibernate settings using literal strings
        hibernateProperties.put("hibernate.tenant_identifier_resolver", this);
        // Explicitly set multi-tenancy strategy to DISCRIMINATOR for Hibernate 6
        hibernateProperties.put("hibernate.multiTenancy", "DISCRIMINATOR");
    }
}
