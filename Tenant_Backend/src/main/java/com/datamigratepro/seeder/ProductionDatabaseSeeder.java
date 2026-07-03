package com.datamigratepro.seeder;

import com.datamigratepro.config.TenantContext;
import com.datamigratepro.entity.AdminUser;
import com.datamigratepro.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class ProductionDatabaseSeeder implements CommandLineRunner {

    @Value("${app.super-admin.username:owner}")
    private String superAdminUsername;

    @Value("${app.super-admin.password:owner123}")
    private String superAdminPassword;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant("system");
            java.util.Optional<AdminUser> rootOwnerOpt = adminUserRepository.findById(superAdminUsername);
            if (rootOwnerOpt.isEmpty()) {
                AdminUser rootOwner = new AdminUser(
                    superAdminUsername,
                    passwordEncoder.encode(superAdminPassword),
                    "SUPER_ADMIN",
                    "all",
                    "Root Owner",
                    "owner@platform.local"
                );
                adminUserRepository.save(rootOwner);
                System.out.println("👤 Production database empty/missing owner. Seeded initial Super Admin credentials!");
            } else {
                AdminUser rootOwner = rootOwnerOpt.get();
                rootOwner.setPassword(passwordEncoder.encode(superAdminPassword));
                adminUserRepository.save(rootOwner);
                System.out.println("👤 Production database already initialized. Ensured Super Admin password matches configuration.");
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
