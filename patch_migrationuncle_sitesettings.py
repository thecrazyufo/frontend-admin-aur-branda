import re

with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'r') as f:
    content = f.read()

# Add the new method
new_method = """
    private void seedMigrationUncleSiteSettings() {
        SiteSetting setting = new SiteSetting();
        setting.setId("settings-migrationuncle");
        setting.setSiteId("migrationuncle");
        setting.setName("Migration Uncle");
        setting.setTagline("Reliable & Friendly Data Migration Tools for Everyone.");
        setting.setDescription("We make migrating your emails, databases, and files as easy as asking your favorite uncle for help. Warm, trustworthy, and effective.");
        setting.setUrl("https://migrationuncle.com");
        setting.setEmail("hello@migrationuncle.com");
        setting.setPhone("+1 (800) 555-UNCLE");
        setting.setAddress("789 Oak Lane, Techville, CA 90210");

        setting.setSocials(new SiteSetting.Socials(
            "https://twitter.com/migrationuncle",
            "https://linkedin.com/company/migrationuncle",
            "https://youtube.com/@migrationuncle",
            "https://facebook.com/migrationuncle",
            "https://github.com/migrationuncle"
        ));

        setting.setStats(Arrays.asList(
            new SiteSetting.StatItem("500K+", "Downloads"),
            new SiteSetting.StatItem("25K+", "Happy Users"),
            new SiteSetting.StatItem("4.9★", "Avg Rating"),
            new SiteSetting.StatItem("99.8%", "Success Rate")
        ));

        setting.setNavigation(Arrays.asList(
            new SiteSetting.NavItem("Products", "/products"),
            new SiteSetting.NavItem("Pricing", "/pricing"),
            new SiteSetting.NavItem("Help Center", "/help"),
            new SiteSetting.NavItem("Careers", "/careers"),
            new SiteSetting.NavItem("Contact", "/contact")
        ));

        setting.setLegalPages(generateLegalPages("Migration Uncle", "https://migrationuncle.com", "hello@migrationuncle.com"));

        siteSettingRepository.save(setting);
    }
"""

if "seedMigrationUncleSiteSettings" not in content:
    # Insert it right before createBrandASiteSetting
    content = content.replace("    private SiteSetting createBrandASiteSetting() {", new_method + "\n    private SiteSetting createBrandASiteSetting() {")

    # Add the invocation inside the migrationuncle block
    # Search for:
    #                 } else if ("migrationuncle".equals(brand)) {
    #                     seedMigrationUncleCatalog();
    #                     seedGlobalRegistryGeneric(brand);
    #                     seedMigrationUncleCareerPositions();
    #                     seedMigrationUncleClients();
    
    invocation_patch = """
                    } else if ("migrationuncle".equals(brand)) {
                        seedMigrationUncleSiteSettings();"""
    
    content = content.replace("} else if (\"migrationuncle\".equals(brand)) {", invocation_patch.strip())

    with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'w') as f:
        f.write(content)
    print("Patched DevDatabaseSeeder.java")
else:
    print("Already patched")
