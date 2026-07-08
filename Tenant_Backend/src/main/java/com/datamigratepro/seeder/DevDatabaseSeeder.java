package com.datamigratepro.seeder;

import com.datamigratepro.config.TenantContext;
import com.datamigratepro.entity.*;
import com.datamigratepro.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.context.annotation.Profile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Component
@Profile("!prod")
public class DevDatabaseSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FaqRepository faqRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private HelpArticleRepository helpArticleRepository;

    @Autowired
    private LicenseKeyRepository licenseKeyRepository;

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private UrlRedirectRepository urlRedirectRepository;

    @Autowired
    private FormatCompatibilityRepository formatCompatibilityRepository;

    @Autowired
    private com.datamigratepro.service.BrandConfigService brandConfigService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private SourceFormatRepository sourceFormatRepository;

    @Autowired
    private TargetFormatRepository targetFormatRepository;

    @Autowired
    private SupportedClientRepository supportedClientRepository;

    @Autowired
    private KeyFeatureRepository keyFeatureRepository;

    @Autowired
    private CareerPositionRepository careerPositionRepository;

    @Autowired
    private ClientLogoRepository clientLogoRepository;

    @Autowired
    private TestimonialRepository testimonialRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            TenantContext.setCurrentTenant("system");
            if (adminUserRepository.count() == 0) {
                adminUserRepository.saveAll(Arrays.asList(
                    // Super Admin (legacy: OWNER) — global access
                    new AdminUser("owner", passwordEncoder.encode("owner123"), "SUPER_ADMIN", "all", "Root Owner", "owner@platform.local"),
                    // Brand A staff
                    new AdminUser("adminA", passwordEncoder.encode("admin123"), "ADMIN", "brandA", "Prism Migration Administrator", "admin@prismmigration.local"),
                    new AdminUser("staffA", passwordEncoder.encode("admin123"), "SEO_CW_PRODUCT_MANAGER", "brandA", "Prism Migration SEO & Product Staff", "staff@prismmigration.local"),
                    // Brand B staff
                    new AdminUser("adminB", passwordEncoder.encode("admin123"), "ADMIN", "brandB", "Brand B Administrator", "admin@brandB.local"),
                    new AdminUser("staffB", passwordEncoder.encode("admin123"), "SEO_CW_PRODUCT_MANAGER", "brandB", "Brand B SEO & Product Staff", "staff@brandB.local")
                ));
                System.out.println("👤 Seeded initial administrator credentials in system database!");
            
            } else {
                System.out.println("👤 Administrator credentials already exist. Skipping credentials seeding.");
            }
        } finally {
            TenantContext.clear();
        }

        List<com.datamigratepro.entity.BrandConfig> brands = brandConfigService.getAllActiveBrands();
        for (com.datamigratepro.entity.BrandConfig brandConfig : brands) {
            String brand = brandConfig.getId();
            try {
                TenantContext.setCurrentTenant(brand);

                if (siteSettingRepository.count() > 0) {
                    System.out.println("🌱 Database " + brand + " already has configurations. Skipping seeding.");
                    continue;
                }

                // Force clear brand-specific database tables to achieve a clean state reset
                categoryRepository.deleteAll();
                faqRepository.deleteAll();
                productRepository.deleteAll();
                blogPostRepository.deleteAll();
                helpArticleRepository.deleteAll();
                careerPositionRepository.deleteAll();
                clientLogoRepository.deleteAll();
                testimonialRepository.deleteAll();
                licenseKeyRepository.deleteAll();
                licenseRepository.deleteAll();
                siteSettingRepository.deleteAll();
                urlRedirectRepository.deleteAll();
                sourceFormatRepository.deleteAll();
                targetFormatRepository.deleteAll();
                supportedClientRepository.deleteAll();
                keyFeatureRepository.deleteAll();
                
                if ("brandA".equals(brand)) {
                    seedCategories();
                    seedGlobalRegistryForBrandA();
                    seedFaqs();
                    seedProducts();
                    seedBlogPosts();
                    seedHelpArticles();
                    seedSiteSettingsForBrandA();
                    seedCareerPositions("brandA");
                    seedClientsForSite("brandA");
                    System.out.println("🌱 Database brandA successfully seeded with full platform catalog!");

                    seedLicenses();
                    System.out.println("🔑 Seeded initial active and testing license keys for brandA!");

                    licenseRepository.saveAll(createBrandLicenses("PST", "brandA"));
                    System.out.println("🔑 Seeded initial valid licenses for brandA!");
                } else if ("apexbyte".equals(brand)) {
                    seedApexByteCatalog();
                    seedGlobalRegistryGeneric(brand);
                    seedApexByteCareerPositions();
                    seedApexByteClients();
                    System.out.println("🌱 Database apexbyte successfully seeded with catalog!");
                    
                    licenseRepository.saveAll(createBrandLicenses("APX", "apexbyte"));
                    System.out.println("🔑 Seeded initial valid licenses for apexbyte!");
                
                } else if ("migrationuncle".equals(brand)) {
                        seedMigrationUncleSiteSettings();
                    seedMigrationUncleCatalog();
                    seedGlobalRegistryGeneric(brand);
                    seedMigrationUncleCareerPositions();
                    seedMigrationUncleClients();
                    System.out.println("🌱 Database migrationuncle successfully seeded with catalog!");
                    
                    licenseRepository.saveAll(createBrandLicenses("MGU", "migrationuncle"));
                    System.out.println("🔑 Seeded initial valid licenses for migrationuncle!");
                } else {
                    if (brand.equals("apexbyte")) {
                        seedApexByteCatalog(brand);
                    } else {
                        seedBrandSpecificCatalog(brand);
                    }
                    seedGlobalRegistryGeneric(brand);
                    seedCareerPositions(brand);
        seedSiteSettingsForApexByte();
                    seedClientsForSite(brand);
                    System.out.println("🌱 Database " + brand + " successfully seeded with catalog!");
                    
                    String prefix = switch (brand) {
                        case "brandB" -> "PSTB";
                        case "brandC" -> "PSTC";
                        case "brandD" -> "PSTD";
                        case "brandE" -> "PSTE";
                        default -> "PST" + brand.substring(brand.length() - 1).toUpperCase();
                    };
                    licenseRepository.saveAll(createBrandLicenses(prefix, brand));
                    System.out.println("🔑 Seeded initial valid licenses for " + brand + "!");
                }
            } finally {
                TenantContext.clear();
            }
        }

        // Seed format compatibility knowledge base (system-level, not per-tenant)
        if (formatCompatibilityRepository.count() == 0) {
            seedFormatCompatibility();
            System.out.println("🔗 Seeded format compatibility matrix for Find Your Tool feature!");
        
        } else {
            System.out.println("🔗 Format compatibility matrix already exists. Skipping seeding.");
        }
    }

    /**
     * Seeds the format compatibility knowledge base.
     * This is system-level data (not per-tenant) representing universal format relationships.
     * Used by GET /api/tools/match for fuzzy matching when no PERFECT_MATCH product is found.
     */
    private void seedFormatCompatibility() {
        formatCompatibilityRepository.deleteAll();
        formatCompatibilityRepository.saveAll(Arrays.asList(
            // ── Microsoft Outlook family (PST ↔ OST) ──────────────────────────────
            new FormatCompatibility("pst-to-ost",               "pst", "ost",              95, "EXACT",      "Same Microsoft binary format family — direct conversion supported"),
            new FormatCompatibility("ost-to-pst",               "ost", "pst",              95, "EXACT",      "Exchange offline cache to Outlook archive — p6 (OST Recovery) handles this"),

            // ── PST/Outlook → Gmail/Google ─────────────────────────────────────────
            new FormatCompatibility("pst-to-gmail",             "pst", "gmail",            88, "SIMILAR",    "p1 migrates PST files directly to Gmail accounts"),
            new FormatCompatibility("outlook-to-gmail",         "outlook", "gmail",         88, "SIMILAR",    "p1 migrates live Outlook mailbox to Gmail"),
            new FormatCompatibility("pst-to-google-workspace",  "pst", "google_workspace", 85, "SIMILAR",    "p1/p5 migrate PST to Google Workspace/G Suite"),
            new FormatCompatibility("ost-to-gmail",             "ost", "gmail",            78, "SIMILAR",    "OST files can be converted via PST bridge — indirect path"),

            // ── Microsoft 365 → Google ─────────────────────────────────────────────
            new FormatCompatibility("o365-to-gws",              "office365", "google_workspace", 92, "EXACT", "p5 directly migrates Office 365 to Google Workspace"),
            new FormatCompatibility("o365-to-gmail",            "office365", "gmail",       88, "SIMILAR",    "p5 migrates O365 Exchange Online emails to Gmail"),
            new FormatCompatibility("exchange-to-gws",          "exchange_online", "google_workspace", 90, "EXACT", "p5 supports Exchange Online to Google Workspace"),

            // ── Gmail/Google → PST/MBOX/EML (Backup) ─────────────────────────────
            new FormatCompatibility("gmail-to-pst",             "gmail", "pst",            82, "SIMILAR",    "p4 (Gmail Backup) exports Gmail directly to PST"),
            new FormatCompatibility("gmail-to-mbox",            "gmail", "mbox",           78, "SIMILAR",    "p4 exports Gmail to MBOX format"),
            new FormatCompatibility("gmail-to-eml",             "gmail", "eml",            75, "SIMILAR",    "p4 exports Gmail to individual EML files"),
            new FormatCompatibility("gws-to-pst",               "google_workspace", "pst", 78, "SIMILAR",    "p4 supports Google Workspace backup to PST"),

            // ── PST ↔ MBOX/EML/MSG ────────────────────────────────────────────────
            new FormatCompatibility("pst-to-mbox",              "pst", "mbox",             72, "COMPATIBLE", "p3 (PST to MBOX Converter) handles this directly"),
            new FormatCompatibility("pst-to-eml",               "pst", "eml",              70, "COMPATIBLE", "Can extract individual EML files from PST"),
            new FormatCompatibility("mbox-to-pst",              "mbox", "pst",             65, "COMPATIBLE", "Reverse MBOX→PST conversion supported"),
            new FormatCompatibility("eml-to-pst",               "eml", "pst",              62, "COMPATIBLE", "Bulk EML to PST aggregation supported"),

            // ── OST → export formats ───────────────────────────────────────────────
            new FormatCompatibility("ost-to-eml",               "ost", "eml",              62, "COMPATIBLE", "p6 (OST Recovery) exports recovered data to EML"),
            new FormatCompatibility("ost-to-msg",               "ost", "msg",              60, "COMPATIBLE", "p6 exports recovered data to MSG format"),
            new FormatCompatibility("ost-to-mbox",              "ost", "mbox",             55, "COMPATIBLE", "Indirect: OST→PST→MBOX path available"),

            // ── Office 365 Backup → PST ────────────────────────────────────────────
            new FormatCompatibility("o365-to-pst",              "office365", "pst",        72, "COMPATIBLE", "p2 (Office 365 Backup) can save backups as PST files"),

            // ── Cross-vendor compatible pairs ──────────────────────────────────────
            new FormatCompatibility("outlook-to-google-workspace", "outlook", "google_workspace", 82, "SIMILAR", "p1 supports Outlook (live) to Google Workspace migration"),
            new FormatCompatibility("o365-to-mbox",             "office365", "mbox",       55, "COMPATIBLE", "Indirect migration path via PST intermediary"),
            new FormatCompatibility("gmail-to-google-workspace","gmail", "google_workspace",70, "COMPATIBLE", "Same Google ecosystem — user/domain consolidation")
        ));
    }

    private void seedLicenses() {
        LicenseKey k1 = new LicenseKey();
        k1.setActivationKey("DMP-1111-2222-3333");
        k1.setOrderId("ORD-99991");
        k1.setProductId("1"); // Outlook to Gmail
        k1.setPricingTierName("Standard");
        k1.setCustomerEmail("user1@example.com");
        k1.setStatus(LicenseStatus.ACTIVE);
        k1.setMaxDevices(1);
        k1.setCreatedAt(java.time.LocalDateTime.now());
        k1.setExpiresAt(java.time.LocalDateTime.now().plusYears(1));
        k1.setSiteId("brandA");

        LicenseKey k2 = new LicenseKey();
        k2.setActivationKey("DMP-5555-6666-7777");
        k2.setOrderId("ORD-99992");
        k2.setProductId("2"); // Office 365 Backup
        k2.setPricingTierName("Business");
        k2.setCustomerEmail("user2@example.com");
        k2.setStatus(LicenseStatus.ACTIVE);
        k2.setMaxDevices(5);
        k2.setCreatedAt(java.time.LocalDateTime.now());
        k2.setExpiresAt(null); // Lifetime
        k2.setSiteId("brandA");

        LicenseKey k3 = new LicenseKey();
        k3.setActivationKey("DMP-8888-9999-0000");
        k3.setOrderId("ORD-99993");
        k3.setProductId("3"); // PST to MBOX
        k3.setPricingTierName("Personal");
        k3.setCustomerEmail("user3@example.com");
        k3.setStatus(LicenseStatus.REVOKED);
        k3.setMaxDevices(1);
        k3.setCreatedAt(java.time.LocalDateTime.now());
        k3.setExpiresAt(null);
        k3.setSiteId("brandA");

        licenseKeyRepository.saveAll(Arrays.asList(k1, k2, k3));
    }

    private void seedNewLicenses() {
        List<License> licenses = new ArrayList<>();
        licenses.addAll(createBrandLicenses("PST", "brandA"));
        licenses.addAll(createBrandLicenses("PSTB", "brandB"));
        licenses.addAll(createBrandLicenses("PSTC", "brandC"));
        licenses.addAll(createBrandLicenses("PSTD", "brandD"));
        licenses.addAll(createBrandLicenses("PSTE", "brandE"));
        licenseRepository.saveAll(licenses);
    }

    private List<License> createBrandLicenses(String prefix, String siteId) {
        License l1 = new License();
        l1.setLicenseKey(prefix + "-ELITE-AAAE-AAAM-AAAD");
        l1.setStatus("ACTIVE");
        l1.setLicenseType("STANDARD");
        l1.setExpiresAt(java.time.OffsetDateTime.now().plusYears(1));
        l1.setMaxActivations(2);
        l1.setSiteId(siteId);

        List<Activation> acts1 = new ArrayList<>();
        Activation act1 = new Activation();
        act1.setLicense(l1);
        act1.setMachineId("mach-" + prefix.toLowerCase() + "-101");
        act1.setMachineName("Developer's MacBook Pro");
        act1.setOsName("macOS Sequoia 15.2");
        act1.setIpAddress("192.168.1.15");
        act1.setActivatedAt(java.time.OffsetDateTime.now().minusDays(15));
        act1.setLastCheckedAt(java.time.OffsetDateTime.now().minusHours(3));
        acts1.add(act1);
        l1.setActivations(acts1);

        License l2 = new License();
        l2.setLicenseKey(prefix + "-ELITE-BBBB-BBBJ-BBBA");
        l2.setStatus("ACTIVE");
        l2.setLicenseType("BUSINESS");
        l2.setExpiresAt(java.time.OffsetDateTime.now().plusYears(2));
        l2.setMaxActivations(3);
        l2.setSiteId(siteId);

        List<Activation> acts2 = new ArrayList<>();
        Activation act2 = new Activation();
        act2.setLicense(l2);
        act2.setMachineId("mach-" + prefix.toLowerCase() + "-201");
        act2.setMachineName("Marketing Win11 Desktop");
        act2.setOsName("Windows 11 Enterprise");
        act2.setIpAddress("10.0.0.122");
        act2.setActivatedAt(java.time.OffsetDateTime.now().minusDays(30));
        act2.setLastCheckedAt(java.time.OffsetDateTime.now().minusDays(1));
        acts2.add(act2);

        Activation act3 = new Activation();
        act3.setLicense(l2);
        act3.setMachineId("mach-" + prefix.toLowerCase() + "-202");
        act3.setMachineName("CEO ThinkPad");
        act3.setOsName("Windows 11 Pro");
        act3.setIpAddress("10.0.0.45");
        act3.setActivatedAt(java.time.OffsetDateTime.now().minusDays(5));
        act3.setLastCheckedAt(java.time.OffsetDateTime.now().minusMinutes(45));
        acts2.add(act3);
        l2.setActivations(acts2);

        License l3 = new License();
        l3.setLicenseKey(prefix + "-ELITE-CCCP-CCCG-CCCO");
        l3.setStatus("REVOKED");
        l3.setLicenseType("ENTERPRISE");
        l3.setExpiresAt(java.time.OffsetDateTime.now().plusYears(3));
        l3.setMaxActivations(10);
        l3.setSiteId(siteId);

        License l4 = new License();
        l4.setLicenseKey(prefix + "-ELITE-DDDM-DDDD-DDDL");
        l4.setStatus("ACTIVE");
        l4.setLicenseType("ENTERPRISE");
        l4.setExpiresAt(java.time.OffsetDateTime.now().plusYears(5));
        l4.setMaxActivations(10);
        l4.setSiteId(siteId);

        License l5 = new License();
        l5.setLicenseKey(prefix + "-ELITE-EEEJ-EEER-EEEI");
        l5.setStatus("ACTIVE");
        l5.setLicenseType("BUSINESS");
        l5.setExpiresAt(java.time.OffsetDateTime.now().plusYears(3));
        l5.setMaxActivations(5);
        l5.setSiteId(siteId);

        License l6 = new License();
        l6.setLicenseKey(prefix + "-ELITE-FFFG-FFFO-FFFF");
        l6.setStatus("ACTIVE");
        l6.setLicenseType("STANDARD");
        l6.setExpiresAt(java.time.OffsetDateTime.now().plusYears(1));
        l6.setMaxActivations(3);
        l6.setSiteId(siteId);

        License l7 = new License();
        l7.setLicenseKey(prefix + "-ELITE-GGGU-GGGL-GGGT");
        l7.setStatus("EXPIRED");
        l7.setLicenseType("STANDARD");
        l7.setExpiresAt(java.time.OffsetDateTime.now().minusDays(10));
        l7.setMaxActivations(3);
        l7.setSiteId(siteId);

        License l8 = new License();
        l8.setLicenseKey(prefix + "-ELITE-HHHR-HHHI-HHHQ");
        l8.setStatus("REVOKED");
        l8.setLicenseType("ENTERPRISE");
        l8.setExpiresAt(java.time.OffsetDateTime.now().plusYears(5));
        l8.setMaxActivations(10);
        l8.setSiteId(siteId);

        return Arrays.asList(l1, l2, l3, l4, l5, l6, l7, l8);
    }


    private void seedCategories() {
        categoryRepository.saveAll(Arrays.asList(
            new Category("email-migration", "Email Migration", "Migrate emails across platforms — Gmail, Outlook, Office 365, Yahoo, and more.", "mail", 12, "blue"),
            new Category("backup", "Backup Tools", "Protect your email data with automated cloud and local backup solutions.", "shield", 8, "green"),
            new Category("file-converter", "File Converters", "Convert between PST, MBOX, EML, MSG, PDF, and other email file formats.", "refresh-cw", 10, "purple"),
            new Category("cloud-migration", "Cloud Migration", "Seamlessly move data between cloud platforms — O365, Google Workspace, AWS.", "cloud", 6, "cyan"),
            new Category("mailbox-recovery", "Mailbox Recovery", "Recover and repair corrupted or inaccessible PST, OST, and mailbox files.", "hard-drive", 7, "orange"),
            new Category("data-export", "Data Export/Import", "Export emails and contacts to CSV, vCard, PDF, HTML, and more.", "download", 5, "red")
        ));
    }

    private void seedFaqs() {
        faqRepository.saveAll(Arrays.asList(
            // General
            new Faq("g1", "What types of software do you offer?", "We offer email migration tools, backup solutions, file converters, cloud migration tools, mailbox recovery software, and data export/import utilities. All our tools are designed for Windows and support enterprise-level use.", "general"),
            new Faq("g2", "Do your tools support all versions of Windows?", "Yes, our tools support Windows 7, 8.1, 10, and 11 in both 32-bit and 64-bit editions. Server versions (2016, 2019, 2022) are also supported for enterprise products.", "general"),
            new Faq("g3", "Is there a free trial available?", "Yes! Every product comes with a free trial version. The trial lets you preview all features and migrate/convert a limited number of items so you can verify the tool works for your needs before purchasing.", "general"),
            // Licensing
            new Faq("l1", "What does a lifetime license mean?", "A lifetime license means you pay once and use the software forever. It includes free updates for 1 year (Standard) or lifetime (Enterprise/Business plans). After the update period, you can continue using the software indefinitely.", "licensing"),
            new Faq("l2", "Can I use one license on multiple computers?", "Each license is tied to one machine by default. If you need multi-machine licensing, check our Business or Enterprise plans, which cover 5–25 machines or unlimited installations.", "licensing"),
            new Faq("l3", "How do I activate my license?", "After purchase, you'll receive an activation key via email. Open the software, click 'Activate License', enter your key, and click Activate. An internet connection is required for first-time activation.", "licensing"),
            new Faq("l4", "What happens if I change my computer?", "You can deactivate your license from the old machine via the software's license manager, then reactivate on the new machine. Each license allows up to 2 machine transfers per year.", "licensing"),
            // Payment
            new Faq("p1", "What payment methods do you accept?", "We accept all major credit/debit cards (Visa, MasterCard, American Express), PayPal, Razorpay (UPI, net banking), and bank wire transfer for enterprise orders above $500.", "payment"),
            new Faq("p2", "Do you offer refunds?", "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the product for any reason, contact our support within 30 days of purchase for a full refund. No questions asked.", "payment"),
            new Faq("p3", "Is my payment information secure?", "Absolutely. All payment transactions are processed through PCI-DSS compliant payment gateways. We never store your credit card information on our servers.", "payment"),
            // Technical
            new Faq("t1", "Do your tools require an internet connection to work?", "Most of our tools work offline once installed. However, cloud migration tools (like O365 to Google Workspace) require an internet connection as they access cloud services directly.", "technical"),
            new Faq("t2", "What should I do if the tool shows an error?", "First, check our Help Center for troubleshooting guides. If the issue persists, contact our support team with the error message and your system details. We typically respond within 4 hours.", "technical"),
            new Faq("t3", "Are your tools safe to use?", "Yes. Our software is digitally signed, malware-free, and scanned regularly. All data processing happens locally on your machine — we never upload your data to our servers.", "technical"),
            // Download
            new Faq("d1", "Where can I download the software after purchase?", "After purchase, you'll receive a download link via email. You can also log in to your account on our website to download any product you've purchased at any time.", "download"),
            new Faq("d2", "How do I get updates for my software?", "When an update is available, the software will notify you. Click 'Update Now' to download and install the latest version. Your license and settings are preserved during updates.", "download")
        ));
    }

    private void seedProducts() {
        // Product 1: Outlook to Gmail
        Product p1 = new Product();
        p1.setId("1");
        p1.setSlug("outlook-to-gmail-migration-tool");
        p1.setName("Outlook to Gmail Migration Toolss");
        p1.setShortDescription("Migrate emails, contacts, and calendars from Outlook/PST to Gmail or Google Workspace seamlessly.");
        p1.setDescription("The most reliable Outlook to Gmail Migration Tool that transfers emails, contacts, calendars, and attachments from PST files or live Outlook accounts directly to Gmail or Google Workspace with 100% data integrity. No data loss, no duplicates — just fast, secure migration.");
        p1.setCategory("email-migration");
        p1.setTags(Arrays.asList("outlook", "gmail", "pst", "email migration", "google workspace"));
        p1.setRating(4.8);
        p1.setReviewCount(2341);
        p1.setDownloads("500K+");
        p1.setBadge("bestseller");
        p1.setVersion("5.2.1");
        p1.setLastUpdated("2025-04-15");
        p1.setTrialDownloadUrl("/download/outlook-to-gmail-trial");
        p1.setFeatures(Arrays.asList(
            "Migrate PST files directly to Gmail accounts",
            "Preserve email folders, subfolders & metadata",
            "Migrate contacts and calendar events",
            "Support for Google Workspace / G Suite",
            "Batch migration for multiple mailboxes",
            "Delta migration — migrate only new items",
            "Maintains email thread conversations",
            "Filter by date range, folder, or category",
            "No file size limitations",
            "256-bit SSL encryption during transfer"
        ));
        p1.setPlatforms(Arrays.asList("Windows 11", "Windows 10", "Windows 8.1", "Windows 7"));
        p1.setSupportedFormats(Arrays.asList(".pst", ".ost", ".msg", ".eml", ".mbox", "Gmail", "Google Workspace"));
        p1.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/otg-1.png", "Main dashboard", "Clean, intuitive migration dashboard"),
            new Screenshot("/screenshots/otg-2.png", "Source selection", "Select source PST or live Outlook"),
            new Screenshot("/screenshots/otg-3.png", "Migration progress", "Real-time migration progress")
        ));
        p1.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Migrate first 50 emails", "Preview mode available", "All features unlocked", "Email support"), "Download Free Trial", "1 mailbox", false),
            new PricingTier("Standard", 49.0, 79.0, "lifetime", Arrays.asList("Unlimited email migration", "1 mailbox license", "Contacts & calendar migration", "1 year free updates", "Priority email support"), "Buy Now", "1 mailbox", true),
            new PricingTier("Enterprise", 199.0, 299.0, "lifetime", Arrays.asList("Unlimited email migration", "25 mailbox licenses", "Batch migration support", "Lifetime free updates", "24/7 phone & chat support", "Dedicated account manager"), "Buy Enterprise", "25 mailboxes", false)
        ));
        p1.setSystemRequirements(new SystemRequirements(
            "Windows 7 / 8.1 / 10 / 11 (32-bit or 64-bit)",
            "1 GHz or faster processor",
            "2 GB RAM minimum (4 GB recommended)",
            "50 MB free disk space",
            Arrays.asList("Microsoft Outlook 2007 or above (for live Outlook migration)", "Active internet connection")
        ));
        p1.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Add Source", "Select your PST file or connect your Outlook account as the source.", "upload"),
            new HowItWorksStep(2, "Choose Destination", "Enter your Gmail or Google Workspace credentials.", "target"),
            new HowItWorksStep(3, "Configure & Filter", "Apply date filters, select folders, and configure options.", "settings"),
            new HowItWorksStep(4, "Start Migration", "Click Migrate and monitor real-time progress with detailed logs.", "play")
        ));
        p1.setFaqs(Arrays.asList(
            new ProductFaq("Does the tool migrate attachments?", "Yes, all email attachments are migrated along with their parent emails. No attachments are left behind."),
            new ProductFaq("Can I migrate from Outlook 2021?", "Yes, the tool supports all Outlook versions from 2007 through 2021 and Microsoft 365."),
            new ProductFaq("Is my data secure during migration?", "Yes, all data is encrypted using 256-bit SSL during transfer. We never store your email data on our servers."),
            new ProductFaq("What happens if the migration is interrupted?", "Our delta migration feature resumes from where it stopped — no duplicate emails are created.")
        ));
        p1.setReviews(Arrays.asList(
            new ProductReview("r1", "James Carter", "IT Administrator", "TechCorp Inc.", 5, "2025-03-10", "Migrated 50,000 emails from Outlook to Google Workspace in under 3 hours. Zero errors. Highly recommend!"),
            new ProductReview("r2", "Sarah Mitchell", "System Engineer", null, 5, "2025-02-14", "Best migration tool I have used. The delta migration feature saved us hours of work during our phased rollout."),
            new ProductReview("r3", "Raj Patel", null, null, 4, "2025-01-30", "Works great! Some large PST files took a bit longer but everything migrated correctly.")
        ));
        p1.setRelatedProductIds(Arrays.asList("2", "3", "5"));
        p1.setSourceFormats(Arrays.asList("pst", "ost", "outlook"));
        p1.setTargetFormats(Arrays.asList("gmail", "google_workspace"));
        p1.setCapabilities(makeCapabilities(false, false, false));
        p1.setSeo(new Seo("Outlook to Gmail Migration Tool — Migrate PST to Gmail Instantly", "Transfer emails, contacts, and calendars from Outlook/PST files to Gmail or Google Workspace with 100% accuracy. Download free trial.", Arrays.asList("outlook to gmail migration", "pst to gmail", "migrate outlook to google workspace", "email migration tool")));
        productRepository.save(p1);

        // Product 2: Office 365 Backup
        Product p2 = new Product();
        p2.setId("2");
        p2.setSlug("office-365-backup-tool");
        p2.setName("Office 365 Backup Tool");
        p2.setShortDescription("Complete backup solution for Microsoft Office 365 — emails, OneDrive, SharePoint, and Teams data.");
        p2.setDescription("Protect your Microsoft 365 data with our comprehensive backup solution. Backup emails, contacts, calendars, OneDrive files, SharePoint sites, and Teams conversations. Restore individual items or full mailboxes in minutes.");
        p2.setCategory("apexbyte-backup");
        p2.setTags(Arrays.asList("office 365", "microsoft 365", "backup", "onedrive", "sharepoint"));
        p2.setRating(4.9);
        p2.setReviewCount(1876);
        p2.setDownloads("300K+");
        p2.setBadge("popular");
        p2.setVersion("3.1.0");
        p2.setLastUpdated("2025-05-01");
        p2.setTrialDownloadUrl("/download/office365-backup-trial");
        p2.setFeatures(Arrays.asList(
            "Backup entire Office 365 mailboxes",
            "Backup OneDrive and SharePoint files",
            "Backup Microsoft Teams conversations",
            "Granular item-level restore",
            "Scheduled automatic backups",
            "Store backups locally or on cloud",
            "Point-in-time recovery",
            "Audit logs and reports",
            "Multi-tenant support",
            "GDPR compliant"
        ));
        p2.setPlatforms(Arrays.asList("Windows 11", "Windows 10", "Windows Server 2019", "Windows Server 2022"));
        p2.setSupportedFormats(Arrays.asList("Office 365 Mailbox", "PST", "OneDrive", "SharePoint", "Teams"));
        p2.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/o365b-1.png", "Backup dashboard", "Comprehensive backup management"),
            new Screenshot("/screenshots/o365b-2.png", "Scheduling", "Set automated backup schedules")
        ));
        p2.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Backup first 25 items", "All services covered", "Email support"), "Download Free Trial", "1 mailbox", false),
            new PricingTier("Standard", 79.0, 119.0, "yearly", Arrays.asList("Unlimited backup items", "5 mailboxes", "All O365 services", "Priority support", "Free updates"), "Buy Now", "5 mailboxes", true),
            new PricingTier("Enterprise", 299.0, 449.0, "yearly", Arrays.asList("Unlimited backup", "Unlimited mailboxes", "All O365 services", "24/7 support", "SLA guarantee"), "Contact Sales", "Unlimited", false)
        ));
        p2.setSystemRequirements(new SystemRequirements(
            "Windows 10 / 11 / Server 2019 / 2022",
            "2 GHz dual-core processor",
            "4 GB RAM (8 GB recommended)",
            "100 MB + storage for backups",
            Arrays.asList("Active Microsoft 365 subscription", "Internet connection")
        ));
        p2.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Connect Microsoft 365", "Authenticate with your Microsoft 365 admin account.", "cloud"),
            new HowItWorksStep(2, "Select Services", "Choose which services to backup — Mail, OneDrive, SharePoint, Teams.", "check-square"),
            new HowItWorksStep(3, "Schedule or Run", "Set up automated schedules or run immediate backup.", "clock"),
            new HowItWorksStep(4, "Restore Anytime", "Restore any item or full mailbox with a few clicks.", "refresh-cw")
        ));
        p2.setFaqs(Arrays.asList(
            new ProductFaq("How often should I backup?", "We recommend daily backups. Our scheduler can automate this at any frequency you need."),
            new ProductFaq("Where are backups stored?", "Backups can be stored locally on your machine, a network drive, or any cloud storage service."),
            new ProductFaq("Can I restore individual emails?", "Yes, our granular restore allows you to recover individual emails, contacts, or files without restoring the full backup.")
        ));
        p2.setReviews(Arrays.asList(
            new ProductReview("r1", "Emma Thompson", "CTO", "StartupHub", 5, "2025-04-20", "Finally a backup solution that covers all O365 services. The restore process is lightning fast."),
            new ProductReview("r2", "David Kim", "IT Manager", null, 5, "2025-03-15", "Saved us from a ransomware attack. Restored 3 years of emails in 20 minutes!")
        ));
        p2.setRelatedProductIds(Arrays.asList("1", "4", "6"));
        p2.setSeo(new Seo("Office 365 Backup Tool — Backup Emails, OneDrive & SharePoint", "Complete Microsoft 365 backup and recovery solution. Backup emails, OneDrive, SharePoint, and Teams. Free trial available.", Arrays.asList("office 365 backup", "microsoft 365 backup", "o365 backup tool", "exchange online backup")));
        p2.setSourceFormats(Arrays.asList("office365", "exchange_online", "onedrive", "sharepoint"));
        p2.setTargetFormats(Arrays.asList("pst"));
        p2.setCapabilities(makeCapabilities(true, true, true));
        productRepository.save(p2);

        // Product 3: PST to MBOX
        Product p3 = new Product();
        p3.setId("3");
        p3.setSlug("pst-to-mbox-converter");
        p3.setName("PST to MBOX Converter");
        p3.setShortDescription("Convert Outlook PST files to MBOX format for Thunderbird, Apple Mail, and other email clients.");
        p3.setDescription("Convert PST to MBOX format quickly and accurately. Supports all versions of PST files and preserves email structure, metadata, attachments, and formatting. Compatible with Thunderbird, Apple Mail, Entourage, Eudora, and more.");
        p3.setCategory("file-converter");
        p3.setTags(Arrays.asList("pst", "mbox", "thunderbird", "apple mail", "converter"));
        p3.setRating(4.7);
        p3.setReviewCount(987);
        p3.setDownloads("200K+");
        p3.setBadge("new");
        p3.setVersion("2.3.0");
        p3.setLastUpdated("2025-04-28");
        p3.setTrialDownloadUrl("/download/pst-to-mbox-trial");
        p3.setFeatures(Arrays.asList(
            "Batch convert multiple PST files at once",
            "Preserves folder hierarchy",
            "Maintains email metadata (date, sender, subject)",
            "Converts attachments without loss",
            "Supports Unicode characters",
            "No Outlook installation required",
            "Generates detailed conversion report",
            "Preview emails before conversion",
            "Filter by date or folder",
            "Works with corrupted PST files"
        ));
        p3.setPlatforms(Arrays.asList("Windows 11", "Windows 10", "Windows 8.1", "Windows 7"));
        p3.setSupportedFormats(Arrays.asList(".pst", ".ost", "MBOX", ".mbox"));
        p3.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/ptm-1.png", "File selection", "Easy PST file selection"),
            new Screenshot("/screenshots/ptm-2.png", "Preview", "Preview emails before conversion")
        ));
        p3.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Convert first 25 emails", "Preview all emails", "All formats supported"), "Download Free", "1 PST file", false),
            new PricingTier("Personal", 29.0, 49.0, "lifetime", Arrays.asList("Unlimited conversion", "All PST/OST formats", "1 year updates", "Email support"), "Buy Now", "Unlimited", true),
            new PricingTier("Business", 99.0, 149.0, "lifetime", Arrays.asList("Unlimited conversion", "5 machine licenses", "Lifetime updates", "Priority support"), "Buy Business", "Unlimited", false)
        ));
        p3.setSystemRequirements(new SystemRequirements(
            "Windows 7 / 8.1 / 10 / 11",
            "1 GHz processor",
            "1 GB RAM",
            "30 MB free space",
            null
        ));
        p3.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Add PST File", "Browse and add your PST or OST file.", "folder-open"),
            new HowItWorksStep(2, "Preview Emails", "Preview all emails and attachments before converting.", "eye"),
            new HowItWorksStep(3, "Select Destination", "Choose output folder for MBOX files.", "folder"),
            new HowItWorksStep(4, "Convert", "Click Convert and get your MBOX file instantly.", "zap")
        ));
        p3.setFaqs(Arrays.asList(
            new ProductFaq("Do I need Outlook installed?", "No, our tool works independently. No Outlook installation is required on your machine."),
            new ProductFaq("Can it handle large PST files?", "Yes, we've tested with PST files up to 100 GB. There is no size limitation.")
        ));
        p3.setReviews(Arrays.asList(
            new ProductReview("r1", "Lisa Chen", null, null, 5, "2025-04-01", "Converted 10 years of Outlook emails to Thunderbird flawlessly. Every attachment was intact."),
            new ProductReview("r2", "Mark Davis", "Freelancer", null, 4, "2025-03-20", "Simple and fast. Did exactly what I needed without any technical knowledge.")
        ));
        p3.setRelatedProductIds(Arrays.asList("1", "4", "6"));
        p3.setSeo(new Seo("PST to MBOX Converter — Convert Outlook PST to Thunderbird MBOX", "Convert PST files to MBOX format with 100% accuracy. Compatible with Thunderbird, Apple Mail. Free trial available.", Arrays.asList("pst to mbox", "convert pst to mbox", "outlook to thunderbird", "pst converter")));
        p3.setSourceFormats(Arrays.asList("pst", "ost"));
        p3.setTargetFormats(Arrays.asList("mbox"));
        p3.setCapabilities(makeCapabilities(false, false, false));
        productRepository.save(p3);

        // Product 4: Gmail Backup
        Product p4 = new Product();
        p4.setId("4");
        p4.setSlug("gmail-backup-tool");
        p4.setName("Gmail Backup Tool");
        p4.setShortDescription("Download and backup your Gmail emails, labels, contacts, and calendars to your local storage.");
        p4.setDescription("Backup your entire Gmail account to your computer in PST, MBOX, EML, or PDF format. Schedule automatic backups, apply filters, and restore data anytime. Keep your Gmail data safe even without internet access.");
        p4.setCategory("backup");
        p4.setTags(Arrays.asList("gmail", "backup", "google", "email backup"));
        p4.setRating(4.6);
        p4.setReviewCount(1543);
        p4.setDownloads("400K+");
        p4.setBadge(null);
        p4.setVersion("4.0.2");
        p4.setLastUpdated("2025-03-20");
        p4.setTrialDownloadUrl("/download/gmail-backup-trial");
        p4.setFeatures(Arrays.asList(
            "Backup Gmail to PST, MBOX, EML, or PDF",
            "Download all labels and folders",
            "Preserve email headers and metadata",
            "Download Gmail contacts and calendars",
            "Scheduled automatic backup",
            "Incremental backup (only new emails)",
            "Apply label-based or date-based filters",
            "Supports Google Workspace accounts",
            "Multiple account backup in one go",
            "Detailed backup reports"
        ));
        p4.setPlatforms(Arrays.asList("Windows 11", "Windows 10", "Windows 8.1"));
        p4.setSupportedFormats(Arrays.asList("Gmail", "Google Workspace", ".pst", ".mbox", ".eml", ".pdf"));
        p4.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/gb-1.png", "Gmail connect", "Securely connect your Gmail account")
        ));
        p4.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Backup first 25 emails", "All export formats", "Email support"), "Download Free", "1 Gmail account", false),
            new PricingTier("Personal", 39.0, 59.0, "lifetime", Arrays.asList("Unlimited Gmail backup", "All formats", "1 year updates", "Priority support"), "Buy Now", "1 account", true),
            new PricingTier("Business", 149.0, 199.0, "lifetime", Arrays.asList("Unlimited backup", "10 Gmail accounts", "Lifetime updates", "24/7 support"), "Buy Business", "10 accounts", false)
        ));
        p4.setSystemRequirements(new SystemRequirements(
            "Windows 8.1 / 10 / 11",
            "1 GHz processor",
            "2 GB RAM",
            "50 MB + storage for backups",
            Arrays.asList("Active Gmail account", "Internet connection")
        ));
        p4.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Login to Gmail", "Securely authenticate with your Google account.", "log-in"),
            new HowItWorksStep(2, "Choose Format", "Select output format: PST, MBOX, EML, or PDF.", "file"),
            new HowItWorksStep(3, "Apply Filters", "Filter by date, labels, or folder.", "filter"),
            new HowItWorksStep(4, "Backup", "Start backup and track progress in real time.", "download")
        ));
        p4.setFaqs(Arrays.asList(
            new ProductFaq("Is it safe to login?", "Yes, we use OAuth 2.0 for authentication. We never see your Google password."),
            new ProductFaq("What formats are supported for export?", "PST, MBOX, EML, and PDF. All industry-standard formats.")
        ));
        p4.setReviews(Arrays.asList(
            new ProductReview("r1", "Nicole Adams", null, null, 5, "2025-04-10", "Backed up 8 years of Gmail to PST in just 2 hours. Perfect for archiving before switching to Outlook.")
        ));
        p4.setRelatedProductIds(Arrays.asList("1", "2", "5"));
        p4.setSeo(new Seo("Gmail Backup Tool — Download Gmail Emails to PST, MBOX, PDF", "Backup your Gmail to PST, MBOX, EML, or PDF. Schedule automatic Gmail backups. Free trial available.", Arrays.asList("gmail backup tool", "download gmail emails", "gmail to pst", "gmail backup software")));
        p4.setSourceFormats(Arrays.asList("gmail", "google_workspace"));
        p4.setTargetFormats(Arrays.asList("pst", "mbox", "eml", "pdf"));
        p4.setCapabilities(makeCapabilities(true, true, false));
        productRepository.save(p4);

        // Product 5: Office 365 to Google Workspace
        Product p5 = new Product();
        p5.setId("5");
        p5.setSlug("office-365-to-google-workspace-migration");
        p5.setName("Office 365 to Google Workspace Migration");
        p5.setShortDescription("Migrate all your Microsoft 365 data to Google Workspace — emails, contacts, calendars, and OneDrive files.");
        p5.setDescription("Complete Microsoft 365 to Google Workspace migration tool. Transfer emails, contacts, calendars, and files from Exchange Online and OneDrive to Gmail and Google Drive. Supports multi-tenant and batch migration.");
        p5.setCategory("cloud-migration");
        p5.setTags(Arrays.asList("office 365", "google workspace", "cloud migration", "exchange", "migration"));
        p5.setRating(4.8);
        p5.setReviewCount(678);
        p5.setDownloads("150K+");
        p5.setBadge("updated");
        p5.setVersion("2.8.0");
        p5.setLastUpdated("2025-05-10");
        p5.setTrialDownloadUrl("/download/o365-to-gw-trial");
        p5.setFeatures(Arrays.asList(
            "Full mailbox migration to Google Workspace",
            "Migrate OneDrive files to Google Drive",
            "Calendar and contacts migration",
            "Delta/incremental migration support",
            "Multi-tenant migration support",
            "Manage migration from admin console",
            "Real-time progress monitoring",
            "Detailed migration reports",
            "Rollback option available",
            "Zero downtime migration"
        ));
        p5.setPlatforms(Arrays.asList("Windows 10", "Windows 11", "Windows Server 2019"));
        p5.setSupportedFormats(Arrays.asList("Office 365", "Exchange Online", "OneDrive", "Gmail", "Google Drive", "Google Workspace"));
        p5.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/o365gw-1.png", "Migration wizard", "Step-by-step migration wizard")
        ));
        p5.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Migrate 10 mailboxes", "All data types", "Email support"), "Start Free Trial", "10 mailboxes", false),
            new PricingTier("Standard", 99.0, 149.0, "lifetime", Arrays.asList("25 mailboxes", "All data types", "1 year updates", "Priority support"), "Buy Now", "25 mailboxes", true),
            new PricingTier("Enterprise", 399.0, 599.0, "lifetime", Arrays.asList("Unlimited mailboxes", "All data types", "Lifetime updates", "24/7 support", "SLA"), "Contact Sales", "Unlimited", false)
        ));
        p5.setSystemRequirements(new SystemRequirements(
            "Windows 10 / 11 / Server 2019",
            "2 GHz processor",
            "4 GB RAM",
            "100 MB free space",
            Arrays.asList("Admin access to Office 365 tenant", "Admin access to Google Workspace")
        ));
        p5.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Connect Source", "Authenticate with your Microsoft 365 admin account.", "cloud"),
            new HowItWorksStep(2, "Connect Destination", "Authenticate with your Google Workspace admin account.", "cloud"),
            new HowItWorksStep(3, "Map Mailboxes", "Map source users to destination Google accounts.", "shuffle"),
            new HowItWorksStep(4, "Migrate", "Start migration and monitor with live progress dashboard.", "arrow-right")
        ));
        p5.setFaqs(Arrays.asList(
            new ProductFaq("Does this work for large organizations?", "Yes, our enterprise plan supports unlimited mailboxes and is designed for large-scale migrations."),
            new ProductFaq("How long does migration take?", "Migration speed depends on data volume. Typically 5–10 GB per hour per mailbox.")
        ));
        p5.setReviews(Arrays.asList(
            new ProductReview("r1", "Tom Richards", "IT Director", "FinTech Corp", 5, "2025-05-01", "Migrated our entire 200-user organization from O365 to Google Workspace in a weekend with zero downtime.")
        ));
        p5.setRelatedProductIds(Arrays.asList("1", "2", "4"));
        p5.setSeo(new Seo("Office 365 to Google Workspace Migration Tool", "Migrate emails, contacts, calendars, and OneDrive files from Microsoft 365 to Google Workspace. Free trial for 10 mailboxes.", Arrays.asList("office 365 to google workspace", "microsoft 365 migration", "exchange to gmail", "cloud migration tool")));
        p5.setSourceFormats(Arrays.asList("office365", "exchange_online", "onedrive"));
        p5.setTargetFormats(Arrays.asList("gmail", "google_workspace", "google_drive"));
        p5.setCapabilities(makeCapabilities(true, true, true));
        productRepository.save(p5);

        // Product 6: OST Recovery
        Product p6 = new Product();
        p6.setId("6");
        p6.setSlug("ost-recovery-tool");
        p6.setName("OST Recovery Tool");
        p6.setShortDescription("Recover and repair corrupted OST files and export data to PST, MSG, EML, or live Outlook profile.");
        p6.setDescription("Recover inaccessible or corrupted Exchange OST files and export emails, contacts, calendars, and tasks to PST, MSG, EML, HTML, or directly into a live Outlook profile. Works even when the Exchange server is unavailable.");
        p6.setCategory("mailbox-recovery");
        p6.setTags(Arrays.asList("ost", "recovery", "repair", "exchange", "ost to pst"));
        p6.setRating(4.7);
        p6.setReviewCount(1122);
        p6.setDownloads("250K+");
        p6.setBadge(null);
        p6.setVersion("6.1.0");
        p6.setLastUpdated("2025-02-28");
        p6.setTrialDownloadUrl("/download/ost-recovery-trial");
        p6.setFeatures(Arrays.asList(
            "Recover emails from corrupted OST files",
            "Export to PST, MSG, EML, HTML, PDF",
            "Works without Exchange server",
            "Recovers permanently deleted items",
            "Preserves folder structure and metadata",
            "Dual recovery modes: Standard and Advanced",
            "Preview recovered items before export",
            "Supports encrypted OST files",
            "Recovers contacts, calendars, tasks, notes",
            "No data overwriting — read-only scanning"
        ));
        p6.setPlatforms(Arrays.asList("Windows 11", "Windows 10", "Windows 8.1", "Windows 7"));
        p6.setSupportedFormats(Arrays.asList(".ost", ".pst", ".msg", ".eml", ".html", ".pdf"));
        p6.setScreenshots(Arrays.asList(
            new Screenshot("/screenshots/ost-1.png", "OST scanner", "Advanced OST scanning engine"),
            new Screenshot("/screenshots/ost-2.png", "Preview recovered data", "Preview all recovered items")
        ));
        p6.setPricing(Arrays.asList(
            new PricingTier("Free Trial", 0.0, null, "lifetime", Arrays.asList("Preview recovered items", "Recover 25 items per folder", "All formats"), "Download Free", "1 OST file", false),
            new PricingTier("Personal", 59.0, 89.0, "lifetime", Arrays.asList("Unlimited recovery", "All export formats", "1 year updates", "Email support"), "Buy Now", "1 OST file", true),
            new PricingTier("Technician", 249.0, 399.0, "lifetime", Arrays.asList("Unlimited OST files", "All export formats", "Lifetime updates", "Priority phone support"), "Buy Technician", "Unlimited", false)
        ));
        p6.setSystemRequirements(new SystemRequirements(
            "Windows 7 / 8.1 / 10 / 11 (32/64-bit)",
            "1 GHz processor",
            "2 GB RAM",
            "50 MB + space for output files",
            Arrays.asList("Microsoft Outlook 2007 or above (for PST export)")
        ));
        p6.setHowItWorks(Arrays.asList(
            new HowItWorksStep(1, "Add OST File", "Browse and load your corrupted or inaccessible OST file.", "file-plus"),
            new HowItWorksStep(2, "Scan & Recover", "Let the tool scan and recover all available data.", "search"),
            new HowItWorksStep(3, "Preview Items", "Preview all emails, contacts, and attachments.", "eye"),
            new HowItWorksStep(4, "Export Data", "Export recovered data to your preferred format.", "save")
        ));
        p6.setFaqs(Arrays.asList(
            new ProductFaq("Will the tool modify my OST file?", "No, the tool works in read-only mode. Your original OST file is never modified."),
            new ProductFaq("Can it recover permanently deleted emails?", "Yes, our advanced scanning engine can recover emails from the deleted items folder and permanently deleted items.")
        ));
        p6.setReviews(Arrays.asList(
            new ProductReview("r1", "Ahmed Hassan", "Network Admin", null, 5, "2025-01-15", "Recovered 3 years of data from a corrupted OST file that even our IT team gave up on. Absolutely incredible tool.")
        ));
        p6.setRelatedProductIds(Arrays.asList("1", "3", "5"));
        p6.setSeo(new Seo("OST Recovery Tool — Recover & Repair Corrupted OST Files", "Recover corrupted or inaccessible OST files. Export to PST, EML, MSG, or Outlook. Preview before saving. Free trial.", Arrays.asList("ost recovery tool", "recover ost file", "ost to pst", "corrupted ost", "exchange ost recovery")));
        p6.setSourceFormats(Arrays.asList("ost"));
        p6.setTargetFormats(Arrays.asList("pst", "msg", "eml", "html", "pdf"));
        p6.setCapabilities(makeCapabilities(false, false, false));
        productRepository.save(p6);
    }

    private void seedBlogPosts() {
        // Blog 1
        BlogPost b1 = new BlogPost();
        b1.setId("1");
        b1.setSlug("gmail-to-office365-migration-guide");
        b1.setTitle("Complete Guide: How to Migrate from Gmail to Office 365 in 2025");
        b1.setExcerpt("Step-by-step guide to migrating your Gmail emails, contacts, and calendar to Microsoft Office 365 without data loss.");
        b1.setContent("# Complete Guide: How to Migrate from Gmail to Office 365 in 2025\n\nMigrating from Gmail to Office 365 can seem daunting, but with the right approach and tools, it's a smooth process. This guide walks you through every step.\n\n## Why Migrate from Gmail to Office 365?\n\nMany organizations migrate from Gmail to Office 365 (now Microsoft 365) for various reasons:\n- Better integration with Microsoft productivity tools\n- Advanced security and compliance features\n- Enterprise-grade email management\n- Familiar Outlook interface\n\n## Pre-Migration Checklist\n\nBefore starting your migration:\n1. Audit your current Gmail usage (mailbox sizes, labels, shared drives)\n2. Create a migration plan and timeline\n3. Communicate with your team\n4. Test with a small batch first\n\n## Step-by-Step Migration Process\n\n### Step 1: Export Gmail Data\nUse Google Takeout or a dedicated migration tool to export your Gmail data.\n\n### Step 2: Prepare Office 365 Environment\nSet up user accounts and configure MX records.\n\n### Step 3: Import Data to Office 365\nUse a migration tool to import your Gmail data while preserving folder structure.\n\n### Step 4: Verify and Test\nCheck that all emails, contacts, and calendar events have migrated correctly.\n\n## Common Issues and Solutions\n\n**Issue: Missing emails after migration**\nSolution: Check spam and trash folders; run incremental migration.\n\n**Issue: Calendar events not syncing**\nSolution: Ensure calendar permissions are set correctly on both sides.");
        b1.setCategory("email-migration");
        b1.setTags(Arrays.asList("gmail", "office 365", "migration", "guide"));
        b1.setAuthor(new Author("Alex Johnson", "Senior Migration Specialist"));
        b1.setPublishedAt("2025-05-15");
        b1.setReadTime(8);
        b1.setCoverImage("/blog/gmail-to-o365.jpg");
        b1.setSeo(new Seo("Gmail to Office 365 Migration Guide 2025 — Step by Step", "Complete guide to migrate Gmail to Office 365. Migrate emails, contacts, and calendars without data loss. Step-by-step instructions.", Arrays.asList("gmail to office 365 migration", "migrate gmail to outlook", "google to microsoft migration")));
        blogPostRepository.save(b1);

        // Blog 2
        BlogPost b2 = new BlogPost();
        b2.setId("2");
        b2.setSlug("how-to-backup-outlook-emails");
        b2.setTitle("How to Backup Outlook Emails: 5 Methods Explained");
        b2.setExcerpt("Learn 5 proven methods to backup your Outlook emails, from manual PST export to automated cloud backup solutions.");
        b2.setContent("# How to Backup Outlook Emails: 5 Methods Explained\n\nLosing your Outlook emails can be catastrophic. Here are 5 reliable methods to keep your data safe.\n\n## Method 1: Export to PST File (Built-in)\nOutlook's built-in export feature creates a PST backup file.\n\n## Method 2: Archive Old Emails\nUse Outlook's Auto-Archive feature to automatically archive older emails.\n\n## Method 3: Use a Dedicated Backup Tool\nProfessional tools offer scheduled backups, incremental backups, and cloud storage support.\n\n## Method 4: Office 365 Backup Service\nIf you're on Microsoft 365, use Microsoft's built-in backup features or a third-party solution.\n\n## Method 5: Manual Copy to Network Drive\nSimple but reliable for small setups.\n\n## Which Method is Best?\n\nFor enterprise environments, we recommend using a dedicated backup tool with scheduling and cloud storage capabilities.");
        b2.setCategory("backup");
        b2.setTags(Arrays.asList("outlook", "backup", "pst", "email backup"));
        b2.setAuthor(new Author("Sarah Williams", "Technical Writer"));
        b2.setPublishedAt("2025-04-20");
        b2.setReadTime(6);
        b2.setCoverImage("/blog/outlook-backup.jpg");
        b2.setSeo(new Seo("How to Backup Outlook Emails — 5 Methods in 2025", "Learn 5 methods to backup Outlook emails including PST export, auto-archive, and dedicated backup tools. Keep your emails safe.", Arrays.asList("backup outlook emails", "outlook email backup", "how to backup outlook", "pst backup")));
        blogPostRepository.save(b2);

        // Blog 3
        BlogPost b3 = new BlogPost();
        b3.setId("3");
        b3.setSlug("pst-vs-ost-file-difference");
        b3.setTitle("PST vs OST Files: Key Differences You Need to Know");
        b3.setExcerpt("Confused between PST and OST files? This guide explains the key differences, use cases, and how to convert between them.");
        b3.setContent("# PST vs OST Files: Key Differences You Need to Know\n\n## What is a PST File?\nPST (Personal Storage Table) is an Outlook data file used to store messages, contacts, and other items locally.\n\n## What is an OST File?\nOST (Offline Storage Table) is a synchronized offline copy of your Exchange mailbox.\n\n## Key Differences\n\n| Feature | PST | OST |\n|---------|-----|-----|\n| Storage | Local PC | Local PC (synced from server) |\n| Access | Anytime | Requires Exchange for sync |\n| Portability | Highly portable | Not portable |\n| Recovery | Complex if corrupted | Tool required |\n\n## When to Use Which?\n\nUse PST for archiving and backups. OST files are used automatically when you connect to Exchange or Office 365.");
        b3.setCategory("tutorials");
        b3.setTags(Arrays.asList("pst", "ost", "outlook", "difference"));
        b3.setAuthor(new Author("Michael Torres", "Email Systems Expert"));
        b3.setPublishedAt("2025-03-10");
        b3.setReadTime(5);
        b3.setCoverImage("/blog/pst-vs-ost.jpg");
        b3.setSeo(new Seo("PST vs OST Files: What's the Difference? | Complete Guide", "Learn the key differences between PST and OST files in Outlook. Understand storage, access, portability, and how to recover or convert them.", Arrays.asList("pst vs ost", "pst file", "ost file", "outlook data file", "difference between pst and ost")));
        blogPostRepository.save(b3);

        // Blog 4
        BlogPost b4 = new BlogPost();
        b4.setId("4");
        b4.setSlug("office-365-backup-best-practices");
        b4.setTitle("Office 365 Backup Best Practices for 2025");
        b4.setExcerpt("Microsoft doesn't fully backup your Office 365 data. Learn best practices for protecting your Microsoft 365 emails, OneDrive, and SharePoint.");
        b4.setContent("# Office 365 Backup Best Practices for 2025\n\n## The Microsoft Shared Responsibility Model\n\nMicrosoft provides infrastructure reliability, but data protection is YOUR responsibility. Here's what you need to know.\n\n## What Microsoft Backs Up (and What They Don't)\n\nMicrosoft protects against hardware failure and infrastructure issues. They do NOT protect against:\n- Accidental deletion\n- Malicious deletion\n- Ransomware attacks\n- Sync errors\n- Retention policy gaps\n\n## Best Practices for O365 Backup\n\n### 1. Follow the 3-2-1 Rule\n3 copies of data, 2 different storage types, 1 offsite location.\n\n### 2. Use Automated Daily Backups\nManual backups are error-prone. Set up automated daily backups.\n\n### 3. Test Your Restores Regularly\nA backup is only as good as your ability to restore from it.\n\n### 4. Cover All Services\nDon't just backup email — also backup OneDrive, SharePoint, and Teams.");
        b4.setCategory("backup");
        b4.setTags(Arrays.asList("office 365", "backup", "best practices", "microsoft 365"));
        b4.setAuthor(new Author("Alex Johnson", "Senior Migration Specialist"));
        b4.setPublishedAt("2025-02-28");
        b4.setReadTime(7);
        b4.setCoverImage("/blog/o365-backup.jpg");
        b4.setSeo(new Seo("Office 365 Backup Best Practices 2025 — Protect Your M365 Data", "Learn Office 365 backup best practices. Microsoft doesn't backup your data — find out how to protect emails, OneDrive, and SharePoint.", Arrays.asList("office 365 backup best practices", "microsoft 365 backup", "o365 data protection", "m365 backup strategy")));
        blogPostRepository.save(b4);
    }

    private void seedHelpArticles() {
        // Help 1
        HelpArticle h1 = new HelpArticle();
        h1.setId("1");
        h1.setSlug("how-to-migrate-pst-to-gmail");
        h1.setTitle("How to Migrate PST Files to Gmail — Step by Step");
        h1.setExcerpt("Complete walkthrough for migrating your Outlook PST files to Gmail using our migration tool.");
        h1.setContent("## System Requirements\n\nBefore starting, ensure your system meets these requirements:\n- Windows 7 or above\n- 2 GB RAM minimum\n- Active Gmail/Google Workspace account\n\n## Step 1: Download and Install\n\nDownload the Outlook to Gmail Migration Tool from our website and run the installer.\n\n## Step 2: Add PST Source\n\n1. Click \"Add File\" on the main screen\n2. Browse to your PST file location\n3. Click Open to load the file\n\n## Step 3: Preview Emails\n\nThe tool will load all emails. Use the preview panel to verify all data is intact.\n\n## Step 4: Set Gmail Destination\n\n1. Click \"Set Destination\"\n2. Select \"Gmail Account\"\n3. Click \"Login with Google\" to authenticate\n4. Grant the necessary permissions\n\n## Step 5: Configure Options\n\n- Enable \"Maintain Folder Structure\" to preserve your Outlook folder organization\n- Set date filters if you want to migrate only specific date ranges\n- Enable \"Skip Duplicates\" to avoid duplicate emails\n\n## Step 6: Start Migration\n\nClick \"Migrate Now\" and monitor progress. Do not close the application until migration completes.\n\n## Troubleshooting\n\n**Error: Google authentication failed**\nSolution: Ensure you're logged into the correct Google account in your browser.\n\n**Migration is slow**\nSolution: Large PST files with many attachments take longer. A 10 GB PST typically takes 1–2 hours.");
        h1.setCategory("migration");
        h1.setTags(Arrays.asList("pst", "gmail", "migration", "outlook"));
        h1.setPublishedAt("2025-04-01");
        h1.setHelpful(234);
        h1.setNotHelpful(12);
        helpArticleRepository.save(h1);

        // Help 2
        HelpArticle h2 = new HelpArticle();
        h2.setId("2");
        h2.setSlug("getting-started-with-office-365-backup");
        h2.setTitle("Getting Started with Office 365 Backup Tool");
        h2.setExcerpt("Learn how to set up and configure your first Office 365 backup in under 10 minutes.");
        h2.setContent("## Introduction\n\nThis guide will help you configure your first Office 365 backup in 10 minutes or less.\n\n## Prerequisites\n\n- Active Microsoft 365 subscription\n- Admin or user credentials for the mailboxes to backup\n- Sufficient local storage for backup files\n\n## Initial Setup\n\n1. Download and install the Office 365 Backup Tool\n2. Launch the application\n3. Click \"New Backup\" on the main screen\n\n## Connecting to Microsoft 365\n\n1. Enter your Microsoft 365 email address\n2. Click \"Sign In with Microsoft\"\n3. Complete the authentication in the popup window\n4. Grant consent for the required permissions\n\n## Selecting What to Backup\n\nChoose the services you want to backup:\n- ✅ Emails & Folders\n- ✅ Contacts\n- ✅ Calendar\n- ✅ OneDrive Files\n- ✅ Teams Messages\n\n## Setting Up the Schedule\n\n1. Click \"Schedule\" tab\n2. Choose frequency: Daily, Weekly, or Monthly\n3. Set the start time (recommend off-hours for large backups)\n4. Click \"Save Schedule\"\n\n## Running Your First Backup\n\nClick \"Backup Now\" to run your first backup immediately. Track progress in the real-time log window.");
        h2.setCategory("getting-started");
        h2.setTags(Arrays.asList("office 365", "backup", "setup", "getting started"));
        h2.setPublishedAt("2025-03-15");
        h2.setHelpful(187);
        h2.setNotHelpful(8);
        helpArticleRepository.save(h2);

        // Help 3
        HelpArticle h3 = new HelpArticle();
        h3.setId("3");
        h3.setSlug("how-to-recover-corrupted-ost-file");
        h3.setTitle("How to Recover a Corrupted or Inaccessible OST File");
        h3.setExcerpt("Step-by-step guide to recover data from a damaged OST file using our OST Recovery Tool.");
        h3.setContent("## Understanding OST Corruption\n\nOST files can become corrupted due to:\n- Abrupt system shutdown during sync\n- Exchange server connectivity issues\n- Virus or malware attacks\n- Oversized OST files (beyond 50 GB limit in older Outlook)\n\n## Recovery Steps\n\n### Step 1: Identify Your OST File Location\n\nDefault location: C:\\\\Users\\\\[Username]\\\\AppData\\\\Local\\\\Microsoft\\\\Outlook\\\\\n\n### Step 2: Load the OST File\n\n1. Open the OST Recovery Tool\n2. Click \"Browse\" and select your OST file\n3. Click \"Open\"\n\n### Step 3: Choose Scan Mode\n\n- **Quick Scan**: For mildly corrupted files (faster)\n- **Advanced Scan**: For severely corrupted files (thorough recovery)\n\n### Step 4: Preview Recovered Data\n\nAfter scanning, browse the recovered data in the preview panel. All emails, contacts, calendars, and tasks will be displayed.\n\n### Step 5: Export Recovered Data\n\n1. Select the items or folders to export\n2. Choose output format: PST, EML, MSG, HTML, or PDF\n3. Click \"Export\" and choose save location\n\n## After Recovery\n\nImport the exported PST file into Outlook using File > Open & Export > Import/Export.");
        h3.setCategory("troubleshooting");
        h3.setTags(Arrays.asList("ost", "recovery", "corrupted", "troubleshooting"));
        h3.setPublishedAt("2025-02-10");
        h3.setHelpful(312);
        h3.setNotHelpful(15);
        helpArticleRepository.save(h3);
    }

    private void seedSiteSettingsForBrandA() {
        SiteSetting defaultSetting = createBrandASiteSetting();
        siteSettingRepository.save(defaultSetting);
    }

    private void seedBrandSpecificCatalog(String brand) {
        String[] sites = {"brandB", "brandC", "brandD", "brandE"};
        String[] siteNames = {"Brand B", "Brand C", "Brand D", "Brand E"};
        String[] catNames = {"Email Migrations", "Database Tools", "Security Backups", "File Converters"};
        String[] prodNames = {"Brand B Business Edition", "Brand C Database Migrator", "Brand D Backup Suite", "Brand E PDF Converter"};
        String[] prodSlugs = {"brandB-business-edition", "brandC-database-migrator", "brandD-backup-suite", "brandE-pdf-converter"};
        String[] prodDescs = {
            "Professional mail server migration software for enterprise mailboxes.",
            "Easily migrate between MySQL, PostgreSQL, SQL Server, and Oracle database servers.",
            "Encrypted cloud and local backup solution to secure your corporate data bytes.",
            "Fastest binary document converter to translate PDF files to Excel, Word, and text."
        };
        String[] siteTaglines = {
            "Enterprise Mail Server & Cloud Mailbox Migrations",
            "Database Server Migrator & Schema Translators",
            "Secure Server Backups & Cloud Sync Operations",
            "Binary File Converters & Document Translators"
        };

        int idx = -1;
        for (int i = 0; i < sites.length; i++) {
            if (sites[i].equals(brand)) {
                idx = i;
                break;
            }
        }

        if (idx == -1) return;

        // Category
        Category cat = new Category(brand + "-cat", catNames[idx], "Tools and utilities for " + catNames[idx].toLowerCase(), "cloud", 1, "blue");
        cat.setSiteId(brand);
        categoryRepository.save(cat);

        // Product
        Product p = new Product();
        p.setId(brand + "-p1");
        p.setSlug(prodSlugs[idx]);
        p.setName(prodNames[idx]);
        p.setShortDescription(prodDescs[idx]);
        p.setDescription("The ultimate " + catNames[idx].toLowerCase() + " utility by " + siteNames[idx]);
        p.setCategory(brand + "-cat");
        p.setSiteId(brand);
        p.setRating(4.7);
        p.setDownloads("25K+");
        p.setVersion("1.0.0");
        p.setLastUpdated("2026-03-01");
        productRepository.save(p);

        // FAQ
        Faq faq = new Faq(brand + "-f1", "How do I get support for " + prodNames[idx] + "?", "You can reach out to our team 24/7 via the help section in " + siteNames[idx] + ".", "general");
        faq.setSiteId(brand);
        faqRepository.save(faq);

        // Site Setting
        SiteSetting defaultSetting = createBrandASiteSetting();
        SiteSetting setting = new SiteSetting();
        setting.setId("settings-" + brand);
        setting.setSiteId(brand);
        setting.setName(siteNames[idx]);
        setting.setTagline(siteTaglines[idx]);
        setting.setDescription("Official storefront for " + siteNames[idx] + ". Advanced solutions for " + siteTaglines[idx].toLowerCase() + ".");
        setting.setUrl("https://" + brand + ".com");
        setting.setEmail("support@" + brand + ".com");
        setting.setPhone("+1 (800) 555-010" + (idx + 1));
        setting.setAddress("456 Suite St, Silicon Valley, CA 94025");

        setting.setSocials(new SiteSetting.Socials(
            "https://twitter.com/" + brand,
            "https://linkedin.com/company/" + brand,
            "https://youtube.com/@" + brand,
            "https://facebook.com/" + brand,
            "https://github.com/" + brand
        ));

        setting.setStats(Arrays.asList(
            new SiteSetting.StatItem("200K+", "Downloads"),
            new SiteSetting.StatItem("15K+", "Happy Users"),
            new SiteSetting.StatItem("4.8★", "Avg Rating"),
            new SiteSetting.StatItem("99.5%", "Success Rate")
        ));

        setting.setTrustBadges(defaultSetting.getTrustBadges());
        setting.setTeamMembers(defaultSetting.getTeamMembers());
        setting.setPricingComparison(defaultSetting.getPricingComparison());
        setting.setPricingFaqs(defaultSetting.getPricingFaqs());
        setting.setLegalPages(generateLegalPages(siteNames[idx], "https://" + brand + ".com", "support@" + brand + ".com"));

        siteSettingRepository.save(setting);
    }


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

        setting.setMainNavigation(Arrays.asList(
            new SiteSetting.NavItem("Products", "/products", null, true, null),
            new SiteSetting.NavItem("Pricing", "/pricing", null, true, null),
            new SiteSetting.NavItem("Help Center", "/help", null, true, null),
            new SiteSetting.NavItem("Careers", "/careers", null, true, null),
            new SiteSetting.NavItem("Contact", "/contact", null, true, null)
        ));

        setting.setLegalPages(generateLegalPages("Migration Uncle", "https://migrationuncle.com", "hello@migrationuncle.com"));

        siteSettingRepository.save(setting);
    }

    private SiteSetting createBrandASiteSetting() {
        SiteSetting defaultSetting = new SiteSetting();
        defaultSetting.setId("settings-brandA");
        defaultSetting.setSiteId("brandA");
        defaultSetting.setName("Prism Migration");
        defaultSetting.setTagline("Migrate Data at Lightning Speed Without Losing a Single Byte.");
        defaultSetting.setDescription("Eliminate downtime and secure your enterprise data. Our automated migration tools handle emails, files, and cloud transfers in seconds—saving you thousands in IT hours.");
        defaultSetting.setUrl("https://prismmigration.com");
        defaultSetting.setEmail("support@prismmigration.com");
        defaultSetting.setPhone("+1 (800) 123-4567");
        defaultSetting.setAddress("123 Tech Park, San Francisco, CA 94107");

        defaultSetting.setSocials(new SiteSetting.Socials(
            "https://twitter.com/prismmigration",
            "https://linkedin.com/company/prismmigration",
            "https://youtube.com/@prismmigration",
            "https://facebook.com/prismmigration",
            "https://github.com/prismmigration"
        ));

        defaultSetting.setStats(Arrays.asList(
            new SiteSetting.StatItem("1M+", "Downloads"),
            new SiteSetting.StatItem("50K+", "Happy Users"),
            new SiteSetting.StatItem("4.9★", "Avg Rating"),
            new SiteSetting.StatItem("99.9%", "Success Rate")
        ));

        defaultSetting.setTrustBadges(Arrays.asList(
            new SiteSetting.TrustBadge("🛡️", "Secure & Safe", "256-bit SSL encryption.", "text-green-600 bg-green-50"),
            new SiteSetting.TrustBadge("🔒", "Privacy First", "No data collection. Local processing only.", "text-blue-600 bg-blue-50"),
            new SiteSetting.TrustBadge("⏱️", "30-Day Guarantee", "Not satisfied? Full refund within 30 days.", "text-amber-600 bg-amber-50"),
            new SiteSetting.TrustBadge("🎧", "24/7 Support", "Expert support team available around the clock.", "text-purple-600 bg-purple-50"),
            new SiteSetting.TrustBadge("🔄", "Free Updates", "Get all future updates included.", "text-cyan-600 bg-cyan-50"),
            new SiteSetting.TrustBadge("🏆", "Award Winning", "Recognized by top industry publications.", "text-red-600 bg-red-50")
        ));

        defaultSetting.setTeamMembers(Arrays.asList(
            new SiteSetting.TeamMember("Michael Ross", "CEO & Co-Founder", "15+ years in enterprise data migration. Former Microsoft engineer.", "MR"),
            new SiteSetting.TeamMember("Jessica Chen", "CTO & Co-Founder", "Expert in distributed systems and data integrity algorithms.", "JC"),
            new SiteSetting.TeamMember("David Kumar", "Head of Product", "Passionate about building tools that solve real IT problems.", "DK"),
            new SiteSetting.TeamMember("Sarah Williams", "Head of Support", "Dedicated to ensuring every customer succeeds with our tools.", "SW")
        ));

        defaultSetting.setPricingComparison(Arrays.asList(
            new SiteSetting.PricingComparisonRow("Email Migration", "50 emails", "Unlimited", "Unlimited"),
            new SiteSetting.PricingComparisonRow("Contacts & Calendar", "Yes", "Yes", "Yes"),
            new SiteSetting.PricingComparisonRow("Folder Structure", "Yes", "Yes", "Yes"),
            new SiteSetting.PricingComparisonRow("Batch Migration", "No", "No", "Yes"),
            new SiteSetting.PricingComparisonRow("Delta Migration", "No", "Yes", "Yes"),
            new SiteSetting.PricingComparisonRow("Number of Licenses", "1", "1", "25"),
            new SiteSetting.PricingComparisonRow("Free Updates", "No", "1 Year", "Lifetime"),
            new SiteSetting.PricingComparisonRow("Technical Support", "Email", "Priority Email", "24/7 Phone & Chat"),
            new SiteSetting.PricingComparisonRow("Price", "Free", "$49", "$199")
        ));

        defaultSetting.setPricingFaqs(Arrays.asList(
            new SiteSetting.PricingFaq("Do I need a subscription?", "No. All our tools use a one-time payment model. Pay once, use forever."),
            new SiteSetting.PricingFaq("Is there a free trial?", "Yes! Every product has a free trial that lets you migrate/convert up to 50 items."),
            new SiteSetting.PricingFaq("What if I'm not satisfied?", "We offer a 30-day money-back guarantee. No questions asked."),
            new SiteSetting.PricingFaq("Do I get free updates?", "Standard plans include 1 year of free updates. Enterprise/Business plans include lifetime updates.")
        ));

        defaultSetting.setLegalPages(generateLegalPages("Prism Migration", "https://prismmigration.com", "support@prismmigration.com"));

        defaultSetting.setMainNavigation(Arrays.asList(
            new SiteSetting.NavItem("Products", "#", null, true, Arrays.asList(
                new SiteSetting.NavItem("Email Migration", "/products?category=email-migration", null, true, null),
                new SiteSetting.NavItem("Backup Tools", "/products?category=backup", null, true, null),
                new SiteSetting.NavItem("File Converters", "/products?category=file-converter", null, true, null),
                new SiteSetting.NavItem("Cloud Migration", "/products?category=cloud-migration", null, true, null),
                new SiteSetting.NavItem("Mailbox Recovery", "/products?category=mailbox-recovery", null, true, null)
            )),
            new SiteSetting.NavItem("Solutions", "#", null, true, Arrays.asList(
                new SiteSetting.NavItem("For Enterprise", "/solutions/enterprise", null, true, null),
                new SiteSetting.NavItem("For Small Business", "/solutions/small-business", null, true, null),
                new SiteSetting.NavItem("For IT Services", "/solutions/it-services", null, true, null)
            )),
            new SiteSetting.NavItem("Resources", "#", null, true, Arrays.asList(
                new SiteSetting.NavItem("Documentation", "/docs", null, true, null),
                new SiteSetting.NavItem("API Reference", "/api-docs", null, true, null),
                new SiteSetting.NavItem("Blog", "/blog", null, true, null),
                new SiteSetting.NavItem("Community Forum", "/community", null, true, null)
            )),
            new SiteSetting.NavItem("Pricing", "/pricing", null, true, null),
            new SiteSetting.NavItem("Careers", "/careers", null, true, null),
            new SiteSetting.NavItem("Our Clients", "/clients", null, true, null)
        ));

        SiteSetting.ClientsPageConfig clients = new SiteSetting.ClientsPageConfig();
        clients.setHeroTitle("Trusted by Leading Organizations");
        clients.setHeroSubtitle("We help companies of all sizes migrate their enterprise data seamlessly, securely, and with zero downtime.");
        clients.setStats(Arrays.asList(
            new SiteSetting.StatItem("150+", "Companies Trust Us"),
            new SiteSetting.StatItem("50+", "Countries Served"),
            new SiteSetting.StatItem("10B+", "Items Migrated"),
            new SiteSetting.StatItem("99.9%", "Success Rate")
        ));
        clients.setCtaTitle("Join Our Growing List of Clients");
        clients.setCtaText("Ready to migrate your database, mailboxes, or cloud storage? Start your risk-free trial today or contact our integration team.");
        clients.setCtaButtonText("Contact Sales");
        clients.setCtaButtonLink("/contact");
        clients.setMetaTitle("Our Clients — Enterprise Data Migration Success Stories");
        clients.setMetaDescription("See how leading organizations use Prism Migration tools to translate, convert, and sync mailbox databases.");
        clients.setMetaKeywords("clients, customers, case studies, enterprise, success stories");
        defaultSetting.setClientsPage(clients);

        return defaultSetting;
    }

    private Map<String, String> generateLegalPages(String siteName, String siteUrl, String supportEmail) {
        Map<String, String> pages = new HashMap<>();

        pages.put("privacy", 
            "<h2>Privacy Policy</h2>" +
            "<p>At " + siteName + ", accessible from <a href=\"" + siteUrl + "\">" + siteUrl + "</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by " + siteName + " and how we use it.</p>" +
            "<h3>1. Information We Collect</h3>" +
            "<p>We collect information directly from you when you register, buy software licenses, or contact our support team. This may include your name, email address, transaction history, and machine-identifying IP details to authenticate and manage your product license keys.</p>" +
            "<h3>2. How We Use Your Information</h3>" +
            "<p>We use the collected data to verify active product licensing, prevent fraudulent license redistribution, distribute software updates, and deliver responsive support services at " + supportEmail + ".</p>" +
            "<h3>3. Data Protection & Security</h3>" +
            "<p>All payment operations are handled securely by PCI-DSS compliant third-party payment gateways. We do not store credit card details. License checking is executed locally on client machines using secure 256-bit SSL connections.</p>"
        );

        pages.put("terms", 
            "<h2>Terms of Service</h2>" +
            "<p>Welcome to " + siteName + ". By accessing <a href=\"" + siteUrl + "\">" + siteUrl + "</a> or downloading our software products, you agree to comply with and be bound by the following terms and conditions of use.</p>" +
            "<h3>1. License to Use</h3>" +
            "<p>We grant you a non-exclusive, non-transferable, and revocable license to use our data tools in accordance with the purchased tier specifications (Standard, Business, or Enterprise).</p>" +
            "<h3>2. Restrictions</h3>" +
            "<p>You are explicitly prohibited from reverse engineering, redistributing, leasing, or sharing single-machine activation keys with unauthorized third parties. Violations will result in immediate license termination without a refund.</p>" +
            "<h3>3. Limitation of Liability</h3>" +
            "<p>In no event shall " + siteName + " be held liable for any data loss, system downtime, or commercial damages arising from the use or inability to use our software products.</p>"
        );

        pages.put("refund", 
            "<h2>Refund Policy</h2>" +
            "<p>We value customer satisfaction and stand behind our products. We offer a <strong>30-day money-back guarantee</strong> on all software purchases to ensure our customers find the software suitable for their needs.</p>" +
            "<h3>1. Guarantee Conditions</h3>" +
            "<p>If our software is unable to perform as advertised, and our support team cannot resolve the technical problem, you are eligible to request a full refund within 30 days of the purchase transaction date.</p>" +
            "<h3>2. How to Request a Refund</h3>" +
            "<p>Please send an email to " + supportEmail + " including your original order receipt, transaction ID, license key details, and a brief description of the technical issue you encountered.</p>" +
            "<h3>3. License Deactivation</h3>" +
            "<p>Upon approval and processing of the refund, all associated product license keys and active machine activations will be immediately deactivated and blacklisted from our licensing validation server.</p>"
        );

        pages.put("license", 
            "<h2>License Agreement (EULA)</h2>" +
            "<p>This End User License Agreement (EULA) is a binding legal agreement between you (an individual or entity) and " + siteName + " for the software product accompanying this agreement.</p>" +
            "<h3>1. License Grant</h3>" +
            "<p>" + siteName + " grants you a personal, non-transferable, non-exclusive license to install and run the software on the number of devices specified in your purchase order (e.g., 1 computer for Standard, up to 25 for Enterprise).</p>" +
            "<h3>2. Intellectual Property Rights</h3>" +
            "<p>The software, its code, structure, design, and assets are the exclusive intellectual property of " + siteName + " and are protected by international copyright laws. No title or property rights are transferred to you.</p>" +
            "<h3>3. Termination</h3>" +
            "<p>This agreement terminates automatically if you fail to comply with any of its terms. Upon termination, you must cease all use of the software and permanently uninstall it from all devices.</p>"
        );

        return pages;
    }

    private Map<String, Boolean> makeCapabilities(boolean multiple, boolean csv, boolean impersonation) {
        Map<String, Boolean> caps = new HashMap<>();
        caps.put("supportsMultipleAccounts", multiple);
        caps.put("supportsBatchCsv", csv);
        caps.put("supportsImpersonation", impersonation);
        return caps;
    }

    private void seedGlobalRegistryForBrandA() {
        sourceFormatRepository.saveAll(Arrays.asList(
            new SourceFormat("sf-pst", "pst", "Outlook PST File", "Microsoft Outlook Personal Storage Table", "mail", "brandA"),
            new SourceFormat("sf-ost", "ost", "Outlook OST File", "Microsoft Outlook Offline Storage Table", "mail", "brandA"),
            new SourceFormat("sf-mbox", "mbox", "MBOX File", "Standard MBOX mailbox archive file", "mail", "brandA"),
            new SourceFormat("sf-eml", "eml", "EML File", "Individual email message file format", "mail", "brandA"),
            new SourceFormat("sf-msg", "msg", "Outlook MSG File", "Outlook individual message format", "mail", "brandA"),
            new SourceFormat("sf-gmail", "gmail", "Gmail / Google Mail", "Google Mail IMAP account", "mail", "brandA"),
            new SourceFormat("sf-office365", "office365", "Office 365 / Outlook.com", "Microsoft 365 Cloud account", "mail", "brandA")
        ));

        targetFormatRepository.saveAll(Arrays.asList(
            new TargetFormat("tf-pst", "pst", "Outlook PST File", "Microsoft Outlook Personal Storage Table", "mail", "brandA"),
            new TargetFormat("tf-mbox", "mbox", "MBOX File", "Standard MBOX mailbox archive file", "mail", "brandA"),
            new TargetFormat("tf-eml", "eml", "EML File", "Individual email message file format", "mail", "brandA"),
            new TargetFormat("tf-pdf", "pdf", "PDF Document", "Portable Document Format for printing/archiving", "file", "brandA"),
            new TargetFormat("tf-gmail", "gmail", "Gmail / Google Mail", "Google Mail IMAP account", "mail", "brandA"),
            new TargetFormat("tf-office365", "office365", "Office 365 / Outlook.com", "Microsoft 365 Cloud account", "mail", "brandA"),
            new TargetFormat("tf-html", "html", "HTML File", "HyperText Markup Language files for web viewing", "file", "brandA")
        ));

        supportedClientRepository.saveAll(Arrays.asList(
            new SupportedClient("sc-outlook", "outlook", "Microsoft Outlook", "Desktop client for Windows & Mac", "mail", "brandA"),
            new SupportedClient("sc-thunderbird", "thunderbird", "Mozilla Thunderbird", "Open-source email desktop client", "mail", "brandA"),
            new SupportedClient("sc-applemail", "applemail", "Apple Mail", "Built-in macOS/iOS email client", "mail", "brandA"),
            new SupportedClient("sc-gmail", "gmail", "Google Webmail", "Gmail web interface on browsers", "mail", "brandA")
        ));

        keyFeatureRepository.saveAll(Arrays.asList(
            new KeyFeature("kf-batch", "supportsMultipleAccounts", "Batch Migration", "Perform multiple migrations simultaneously", "brandA"),
            new KeyFeature("kf-filters", "supportsBatchCsv", "Batch CSV Import", "Filter and import migrations via a CSV file list", "brandA"),
            new KeyFeature("kf-preview", "supportsIncrementalSync", "Incremental Sync", "Migrate only new or modified items on subsequent runs", "brandA"),
            new KeyFeature("kf-impersonation", "supportsImpersonation", "Domain Impersonation", "Administrator level domain impersonation for office migrations", "brandA")
        ));
    }

    private void seedGlobalRegistryGeneric(String brand) {
        sourceFormatRepository.saveAll(Arrays.asList(
            new SourceFormat(brand + "-sf-pst", "pst", "Outlook PST File", "Microsoft Outlook Personal Storage Table", "mail", brand),
            new SourceFormat(brand + "-sf-mbox", "mbox", "MBOX File", "Standard MBOX mailbox archive file", "mail", brand)
        ));

        targetFormatRepository.saveAll(Arrays.asList(
            new TargetFormat(brand + "-tf-pst", "pst", "Outlook PST File", "Microsoft Outlook Personal Storage Table", "mail", brand),
            new TargetFormat(brand + "-tf-pdf", "pdf", "PDF Document", "Portable Document Format for printing/archiving", "file", brand)
        ));

        supportedClientRepository.saveAll(Arrays.asList(
            new SupportedClient(brand + "-sc-outlook", "outlook", "Microsoft Outlook", "Desktop client for Windows & Mac", "mail", brand)
        ));

        keyFeatureRepository.saveAll(Arrays.asList(
            new KeyFeature(brand + "-kf-batch", "supportsMultipleAccounts", "Batch Migration", "Perform multiple migrations simultaneously", brand)
        ));
    }

    private void seedCareerPositions(String siteId) {
        CareerPosition p1 = new CareerPosition();
        p1.setId("career-" + siteId + "-1");
        p1.setTitle("Senior Java Developer");
        p1.setLocation("Remote, US");
        p1.setType("Full-Time");
        p1.setDescription("We are seeking a senior-level Java engineer with 5+ years of experience in high-performance backends.");
        p1.setRequirements("• 5+ years of experience with Java and Spring Boot\n• Strong knowledge of SQL databases and Liquibase\n• Excellent problem-solving skills");
        p1.setStatus("OPEN");
        p1.setMetaTitle("Join Us as a Senior Java Developer");
        p1.setMetaDescription("Apply now for the Senior Java Developer position at our enterprise solutions team.");
        p1.setMetaKeywords("java, developer, remote, spring boot");
        p1.setSiteId(siteId);

        CareerPosition p2 = new CareerPosition();
        p2.setId("career-" + siteId + "-2");
        p2.setTitle("Technical Writer");
        p2.setLocation("Hybrid, New York");
        p2.setType("Part-Time");
        p2.setDescription("Looking for a technical writer to document system architectures and write user guide manuals.");
        p2.setRequirements("• Experience in technical documentation or technical writing\n• Familiarity with Markdown and Markdown rendering engines\n• Basic understanding of enterprise software concepts");
        p2.setStatus("OPEN");
        p2.setMetaTitle("We are hiring: Technical Writer");
        p2.setMetaDescription("Help us write clear technical guide documentation.");
        p2.setMetaKeywords("writer, documentation, markdown");
        p2.setSiteId(siteId);

        CareerPosition p3 = new CareerPosition();
        p3.setId("career-" + siteId + "-3");
        p3.setTitle("Product Manager (Migration Suite)");
        p3.setLocation("Remote, Global");
        p3.setType("Full-Time");
        p3.setDescription("Help define the roadmap for our next-generation data migration and integration platforms.");
        p3.setRequirements("• 3+ years in product management for B2B developer tools\n• Deep understanding of ETL, cloud databases, or data migration\n• Strong communication skills");
        p3.setStatus("OPEN");
        p3.setMetaTitle("Product Manager Job Opening");
        p3.setMetaDescription("Lead the roadmap for our migration tools.");
        p3.setMetaKeywords("product manager, migration, B2B");
        p3.setSiteId(siteId);

        careerPositionRepository.saveAll(Arrays.asList(p1, p2, p3));
        System.out.println("💼 Seeded 3 career positions for site: " + siteId);
    }

    private void seedClientsForSite(String siteId) {
        // Seed client logos (with company name, logo url, description, case study)
        ClientLogo l1 = new ClientLogo();
        l1.setId("client-" + siteId + "-1");
        l1.setSiteId(siteId);
        l1.setCompanyName("Acme Corp");
        l1.setLogoUrl("/images/logos/acme.svg");
        l1.setDisplayOrder(1);
        l1.setDescription("A global manufacturing leader with over 10,000 mailboxes.");
        l1.setCaseStudy("Acme Corp migrated 12TB of legacy Exchange database mailboxes to Office 365 over a single weekend with zero data loss using our email migration suite.");
        
        ClientLogo l2 = new ClientLogo();
        l2.setId("client-" + siteId + "-2");
        l2.setSiteId(siteId);
        l2.setCompanyName("Stark Industries");
        l2.setLogoUrl("/images/logos/stark.svg");
        l2.setDisplayOrder(2);
        l2.setDescription("An advanced research and defense contractor.");
        l2.setCaseStudy("Stark Industries integrated our secure backup and delta sync synchronization engine to mirror real-time CAD assets across their remote laboratories.");

        ClientLogo l3 = new ClientLogo();
        l3.setId("client-" + siteId + "-3");
        l3.setSiteId(siteId);
        l3.setCompanyName("Wayne Enterprises");
        l3.setLogoUrl("/images/logos/wayne.svg");
        l3.setDisplayOrder(3);
        l3.setDescription("A diversified multinational conglomerate.");
        l3.setCaseStudy("Wayne Enterprises consolidated 5 legacy PST database servers into a unified cloud archive, streamlining compliance and reducing storage overhead.");

        clientLogoRepository.saveAll(Arrays.asList(l1, l2, l3));

        // Seed some testimonials as well
        Testimonial t1 = new Testimonial();
        t1.setId("test-" + siteId + "-1");
        t1.setSiteId(siteId);
        t1.setAuthorName("Pepper Potts");
        t1.setAuthorTitle("CEO");
        t1.setCompany("Stark Industries");
        t1.setContent("The data integrity and speed of the migration tool exceeded all our expectations. We moved massive databases without a single byte of corruption.");
        t1.setRating(5);
        t1.setIsFeatured(true);

        Testimonial t2 = new Testimonial();
        t2.setId("test-" + siteId + "-2");
        t2.setSiteId(siteId);
        t2.setAuthorName("Lucius Fox");
        t2.setAuthorTitle("Business Manager");
        t2.setCompany("Wayne Enterprises");
        t2.setContent("Simplest database migration interface we've ever used. The dry-run validation caught format mismatches before writing a single record.");
        t2.setRating(5);
        t2.setIsFeatured(true);

        testimonialRepository.saveAll(Arrays.asList(t1, t2));
        System.out.println("💼 Seeded client logos and testimonials for site: " + siteId);
    }

    private void seedApexByteCatalog() {
        // 1. Categories
        Category c1 = new Category();
        c1.setId("apexbyte-migration");
        c1.setSlug("apexbyte-migration");
        c1.setLabel("Migration Tools");
        c1.setDescription("Enterprise-grade tools to migrate email servers and cloud mailboxes.");
        
        Category c2 = new Category();
        c2.setId("apexbyte-backup");
        c2.setSlug("apexbyte-backup");
        c2.setLabel("Backup Solutions");
        c2.setDescription("Securely backup and archive your critical corporate data.");

        Category c3 = new Category();
        c3.setId("apexbyte-converters");
        c3.setSlug("apexbyte-converters");
        c3.setLabel("File Converters");
        c3.setDescription("Fast and accurate binary file converters for documents and archives.");

        Category c4 = new Category();
        c4.setId("apexbyte-database");
        c4.setSlug("apexbyte-database");
        c4.setLabel("Database Tools");
        c4.setDescription("Migrate between SQL Server, Oracle, MySQL, and PostgreSQL seamlessly.");

        categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4));

        // 2. Products
        Product p1 = new Product();
        p1.setId("apexbyte-exchange-migrator");
        p1.setSlug("apexbyte-exchange-migrator");
        p1.setName("ApexByte Exchange Migrator");
        p1.setShortDescription("Seamlessly migrate on-premise Exchange to Microsoft 365.");
        p1.setDescription("Our flagship product for enterprise Exchange migrations with zero downtime.");
        p1.setCategory("apexbyte-migration");
        p1.setBadge("bestseller");
        
        PricingTier p1t1 = new PricingTier("Standard", 199.0, null, "user", Arrays.asList("10 Mailboxes", "Standard Support"), "Buy Now", null, false);
        PricingTier p1t2 = new PricingTier("Enterprise", 499.0, null, "user", Arrays.asList("Unlimited Mailboxes", "Priority Support"), "Contact Sales", null, true);
        p1.setPricing(Arrays.asList(p1t1, p1t2));

        ProductReview p1r1 = new ProductReview("r1", "John Doe", "IT Director", "TechCorp", 5, "2025-01-10", "Migrated 500 users over the weekend without a hitch. Incredible tool.");
        p1.setReviews(Arrays.asList(p1r1));

        Product p2 = new Product();
        p2.setId("apexbyte-cloud-backup-pro");
        p2.setSlug("apexbyte-cloud-backup-pro");
        p2.setName("ApexByte Cloud Backup Pro");
        p2.setShortDescription("Automated, encrypted backups for AWS, Azure, and Google Cloud.");
        p2.setDescription("Ensure business continuity with point-in-time recovery for your cloud infrastructure.");
        p2.setCategory("apexbyte-backup");
        p2.setBadge("popular");

        PricingTier p2t1 = new PricingTier("Business", 299.0, null, "server", Arrays.asList("Daily Backups", "AES-256 Encryption"), "Get Started", null, false);
        p2.setPricing(Arrays.asList(p2t1));

        ProductReview p2r1 = new ProductReview("r2", "Sarah Smith", "DevOps Lead", "CloudNative Inc.", 5, "2025-02-15", "Saved us from a major data loss incident last month. Worth every penny.");
        p2.setReviews(Arrays.asList(p2r1));

        Product p3 = new Product();
        p3.setId("apexbyte-pdf-converter");
        p3.setSlug("apexbyte-pdf-converter");
        p3.setName("ApexByte PDF to Word Converter");
        p3.setShortDescription("High-fidelity document conversion retaining exact formatting.");
        p3.setDescription("Convert massive batches of PDF files into editable Word documents instantly.");
        p3.setCategory("apexbyte-converters");
        
        PricingTier p3t1 = new PricingTier("Personal", 49.0, null, "license", Arrays.asList("Unlimited Conversions", "Basic Support"), "Buy License", null, false);
        p3.setPricing(Arrays.asList(p3t1));

        ProductReview p3r1 = new ProductReview("r3", "Michael Chang", "Legal Associate", "Law Firm LLP", 4, "2025-03-01", "Handles complex legal formatting much better than Adobe.");
        p3.setReviews(Arrays.asList(p3r1));

        Product p4 = new Product();
        p4.setId("apexbyte-sql-migrator");
        p4.setSlug("apexbyte-sql-migrator");
        p4.setName("ApexByte SQL Schema Migrator");
        p4.setShortDescription("Translate schemas and move data between major relational databases.");
        p4.setDescription("Supports Oracle, SQL Server, MySQL, and PostgreSQL with automated schema translation.");
        p4.setCategory("apexbyte-database");
        p4.setBadge("new");
        
        PricingTier p4t1 = new PricingTier("Professional", 899.0, null, "license", Arrays.asList("Cross-database support", "Schema Mapping AI"), "Request Demo", null, true);
        p4.setPricing(Arrays.asList(p4t1));

        ProductReview p4r1 = new ProductReview("r4", "Elena Rodriguez", "DBA", "FinTech Solutions", 5, "2025-04-12", "The automated type mapping saved us weeks of manual work.");
        p4.setReviews(Arrays.asList(p4r1));
        
        Product p5 = new Product();
        p5.setId("apexbyte-duplicate-remover");
        p5.setSlug("apexbyte-duplicate-remover");
        p5.setName("ApexByte Outlook Duplicate Remover");
        p5.setShortDescription("Clean up cluttered Outlook mailboxes with smart algorithms.");
        p5.setDescription("Identifies and removes exact and partial duplicate emails, contacts, and calendar events.");
        p5.setCategory("apexbyte-migration");
        
        PricingTier p5t1 = new PricingTier("Standard", 29.0, null, "license", Arrays.asList("Email Cleanup", "Contact Merging"), "Buy Now", null, false);
        p5.setPricing(Arrays.asList(p5t1));
        
        ProductReview p5r1 = new ProductReview("r5", "David Kim", "Executive Assistant", "Global Corp", 5, "2025-05-20", "Freed up 10GB in my boss's mailbox in just 5 minutes.");
        p5.setReviews(Arrays.asList(p5r1));

        Product p6 = new Product();
        p6.setId("apexbyte-gws-backup");
        p6.setSlug("apexbyte-gws-backup");
        p6.setName("ApexByte Google Workspace Backup");
        p6.setShortDescription("Comprehensive backup for Gmail, Drive, Docs, and Sites.");
        p6.setDescription("Protect your entire Google Workspace environment against ransomware and accidental deletion.");
        p6.setCategory("apexbyte-backup");
        p6.setBadge("popular");
        
        PricingTier p6t1 = new PricingTier("Enterprise", 399.0, null, "domain", Arrays.asList("Unlimited Users", "1-Click Restore"), "Contact Sales", null, true);
        p6.setPricing(Arrays.asList(p6t1));
        
        ProductReview p6r1 = new ProductReview("r6", "Lisa Wong", "IT Manager", "EduTech", 5, "2025-06-10", "Restoring a deleted user's drive took less than a minute.");
        p6.setReviews(Arrays.asList(p6r1));

        productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));

        // 3. FAQs
        Faq f1 = new Faq();
        f1.setId("faq-apex-1");
        f1.setQuestion("Do you offer technical support during migrations?");
        f1.setAnswer("Yes, all our Enterprise licenses come with 24/7 priority support and dedicated migration engineers.");
        f1.setProductId("apexbyte-exchange-migrator");
        f1.setCategory("General");
        f1.setSiteId("apexbyte");

        Faq f2 = new Faq();
        f2.setId("faq-apex-2");
        f2.setQuestion("Can I try the software before buying?");
        f2.setAnswer("Absolutely. We offer fully-functional free trials for all our products.");
        f2.setCategory("General");
        f2.setSiteId("apexbyte");
        
        Faq f3 = new Faq();
        f3.setId("faq-apex-3");
        f3.setQuestion("What is your refund policy?");
        f3.setAnswer("We offer a strict 30-day money-back guarantee if the software fails to perform the described tasks and our support team cannot resolve the issue.");
        f3.setCategory("General");
        f3.setSiteId("apexbyte");
        
        Faq f4 = new Faq();
        f4.setId("faq-apex-4");
        f4.setQuestion("Are my backups encrypted?");
        f4.setAnswer("Yes, ApexByte Cloud Backup Pro uses AES-256 military-grade encryption both in-transit and at-rest.");
        f4.setProductId("apexbyte-cloud-backup-pro");
        f4.setCategory("Security");
        f4.setSiteId("apexbyte");
        
        Faq f5 = new Faq();
        f5.setId("faq-apex-5");
        f5.setQuestion("Does the SQL migrator support stored procedures?");
        f5.setAnswer("Yes, our schema translation AI attempts to convert stored procedures between major dialects, though complex logic may require manual review.");
        f5.setProductId("apexbyte-sql-migrator");
        f5.setCategory("Technical");
        f5.setSiteId("apexbyte");

        faqRepository.saveAll(Arrays.asList(f1, f2, f3, f4, f5));

        // 4. Guides (Help Articles)
        HelpArticle h1 = new HelpArticle();
        h1.setId("help-apex-1");
        h1.setSiteId("apexbyte");
        h1.setSlug("exchange-migration-best-practices");
        h1.setTitle("Best Practices for Zero-Downtime Exchange Migrations");
        h1.setContent("A comprehensive guide on planning, staging, and executing a migration from on-prem Exchange to Microsoft 365. Always run a delta sync after the final cutover.");
        h1.setCategory("Migration");
        h1.setTags(Arrays.asList("Exchange","Office365","Enterprise"));

        HelpArticle h2 = new HelpArticle();
        h2.setId("help-apex-2");
        h2.setSiteId("apexbyte");
        h2.setSlug("configuring-cloud-backup-schedules");
        h2.setTitle("How to Configure Optimal Cloud Backup Schedules");
        h2.setContent("Learn how to balance RPO/RTO requirements with storage costs by setting up tiered retention policies in ApexByte Cloud Backup Pro.");
        h2.setCategory("Backup");
        h2.setTags(Arrays.asList("Cloud","AWS","Azure"));

        HelpArticle h3 = new HelpArticle();
        h3.setId("help-apex-3");
        h3.setSiteId("apexbyte");
        h3.setSlug("translating-oracle-to-postgres");
        h3.setTitle("Translating Oracle Schemas to PostgreSQL");
        h3.setContent("A deep dive into how ApexByte handles specific Oracle data types like NUMBER and VARCHAR2 when migrating to PostgreSQL.");
        h3.setCategory("Database");
        h3.setTags(Arrays.asList("Oracle","PostgreSQL","SQL"));
        
        HelpArticle h4 = new HelpArticle();
        h4.setId("help-apex-4");
        h4.setSiteId("apexbyte");
        h4.setSlug("troubleshooting-pdf-fonts");
        h4.setTitle("Troubleshooting Missing Fonts in PDF Conversions");
        h4.setContent("If your converted Word document looks different from the PDF, ensure the original fonts are installed on your system or enable 'Embed Missing Fonts' in the settings.");
        h4.setCategory("Converters");
        h4.setTags(Arrays.asList("PDF","Word","Formatting"));

        HelpArticle h5 = new HelpArticle();
        h5.setId("help-apex-5");
        h5.setSiteId("apexbyte");
        h5.setSlug("removing-duplicates-safely");
        h5.setTitle("How to Remove Outlook Duplicates Safely");
        h5.setContent("Always run a backup before removing duplicates. Use our 'Simulate' mode first to review the items that will be deleted.");
        h5.setCategory("Maintenance");
        h5.setTags(Arrays.asList("Outlook","Cleanup"));

        helpArticleRepository.saveAll(Arrays.asList(h1, h2, h3, h4, h5));
    }

    private void seedApexByteCareerPositions() {
        CareerPosition cp1 = new CareerPosition();
        cp1.setId("se-backend-apex");
        cp1.setSiteId("apexbyte");
        cp1.setTitle("Senior Backend Engineer (Java)");
        cp1.setLocation("Remote (US/Canada)");
        cp1.setType("Full-time");
        cp1.setDescription("We are looking for an experienced Java Spring Boot engineer to help build the next generation of our data migration engine. You will be working on highly concurrent data streaming pipelines.");
        cp1.setRequirements("- 5+ years of Java experience\n- Strong understanding of Spring Boot\n- Experience with concurrent programming\n- Familiarity with PostgreSQL");
        cp1.setStatus("OPEN");
        
        CareerPosition cp2 = new CareerPosition();
        cp2.setId("tech-support-apex");
        cp2.setSiteId("apexbyte");
        cp2.setTitle("Technical Support Specialist");
        cp2.setLocation("London, UK / Remote");
        cp2.setType("Full-time");
        cp2.setDescription("Join our global support team to assist enterprise clients with complex database and email migrations. Excellent communication skills required.");
        cp2.setRequirements("- 2+ years in technical support\n- Knowledge of Microsoft Exchange and Office 365\n- Basic SQL knowledge\n- Excellent written English");
        cp2.setStatus("OPEN");
        
        CareerPosition cp3 = new CareerPosition();
        cp3.setId("product-manager-apex");
        cp3.setSiteId("apexbyte");
        cp3.setTitle("Product Manager - Cloud Solutions");
        cp3.setLocation("San Francisco, CA");
        cp3.setType("Full-time");
        cp3.setDescription("Lead the product strategy for our rapidly growing suite of cloud backup solutions.");
        cp3.setRequirements("- 3+ years in B2B SaaS Product Management\n- Experience in the data backup/security space\n- Strong analytical skills");
        cp3.setStatus("OPEN");

        careerPositionRepository.saveAll(Arrays.asList(cp1, cp2, cp3));
    }

    private void seedApexByteClients() {
        ClientLogo cl1 = new ClientLogo();
        cl1.setId("apex-client-1");
        cl1.setSiteId("apexbyte");
        cl1.setCompanyName("Acme Corp");
        cl1.setLogoUrl("/logos/acme.svg"); // The UI will gracefully fallback if missing

        ClientLogo cl2 = new ClientLogo();
        cl2.setId("apex-client-2");
        cl2.setSiteId("apexbyte");
        cl2.setCompanyName("GlobalNet");
        cl2.setLogoUrl("/logos/globalnet.svg");

        clientLogoRepository.saveAll(Arrays.asList(cl1, cl2));
    }


    private void seedMigrationUncleCatalog() {
        TenantContext.setCurrentTenant("migrationuncle");

        // 1. Categories
        Category c1 = new Category();
        c1.setId("mgu-migration");
        c1.setSlug("migration");
        c1.setLabel("Migration");
        c1.setDescription("Simple and reliable tools to move emails and data from one platform to another.");
        
        Category c2 = new Category();
        c2.setId("mgu-backup");
        c2.setSlug("backup");
        c2.setLabel("Backup");
        c2.setDescription("Securely backup your emails and data to prevent any loss.");

        Category c3 = new Category();
        c3.setId("mgu-converter");
        c3.setSlug("converter");
        c3.setLabel("Converter");
        c3.setDescription("Convert your files into universal formats that you can read anywhere.");

        Category c4 = new Category();
        c4.setId("mgu-utility");
        c4.setSlug("utility");
        c4.setLabel("Utility");
        c4.setDescription("Handy utilities to clean up and organize your digital life.");

        categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4));

        // 2. Products
        Product p1 = new Product();
        p1.setId("uncle-pst-to-gmail");
        p1.setSlug("pst-to-gmail-converter");
        p1.setName("PST to Gmail Converter");
        p1.setShortDescription("The easiest way to move your old Outlook data to your Google account.");
        p1.setDescription("Don't let your old emails collect dust. Uncle's tool helps you seamlessly transfer all your Outlook PST files to your new Gmail account with just a few clicks. It's safe, secure, and incredibly friendly to use.");
        p1.setCategory("mgu-migration");
        p1.setBadge("bestseller");
        PricingTier p1t1 = new PricingTier("Home User", 29.0, null, "user", Arrays.asList("Up to 5 accounts", "Friendly Email Support"), "Get It Now", null, false);
        p1.setPricing(Arrays.asList(p1t1));
        ProductReview p1r1 = new ProductReview("r1", "Mary P.", "Retired Teacher", "Home User", 5, "2025-01-10", "I was so worried about losing my emails, but this tool was a breeze to use!");
        p1.setReviews(Arrays.asList(p1r1));

        Product p2 = new Product();
        p2.setId("uncle-ost-recovery");
        p2.setSlug("ost-recovery-tool");
        p2.setName("OST Recovery Tool");
        p2.setShortDescription("Rescue your data from corrupted Outlook offline files.");
        p2.setDescription("Got an OST file you can't open? Don't panic. Uncle's recovery kit will repair the file and extract your emails, contacts, and calendars so you can get back to work.");
        p2.setCategory("mgu-utility");
        PricingTier p2t1 = new PricingTier("Standard", 49.0, null, "license", Arrays.asList("Unlimited Recoveries", "Priority Support"), "Buy License", null, false);
        p2.setPricing(Arrays.asList(p2t1));

        Product p3 = new Product();
        p3.setId("uncle-duplicate-cleaner");
        p3.setSlug("duplicate-cleaner");
        p3.setName("Duplicate Cleaner");
        p3.setShortDescription("Tidy up your messy mailbox by finding and removing duplicate emails.");
        p3.setDescription("Is your inbox full of the same message? Uncle's Duplicate Cleaner scans your accounts and safely removes identical copies, giving you your space back.");
        p3.setCategory("mgu-utility");
        p3.setBadge("new");
        PricingTier p3t1 = new PricingTier("Standard", 25.0, null, "license", Arrays.asList("Safe Mode Review", "Works with Outlook & IMAP"), "Clean Inbox", null, true);
        p3.setPricing(Arrays.asList(p3t1));
        ProductReview p3r1 = new ProductReview("r4", "Bob Jenkins", "Small Business Owner", "Bob's Plumbing", 5, "2025-04-12", "Finally got rid of 3,000 duplicate emails that were driving me crazy.");
        p3.setReviews(Arrays.asList(p3r1));

        Product p4 = new Product();
        p4.setId("uncle-cloud-migration-kit");
        p4.setSlug("cloud-migration-kit");
        p4.setName("Cloud Migration Kit");
        p4.setShortDescription("Move all your local files and emails to the cloud safely.");
        p4.setDescription("Moving to the cloud doesn't have to be scary. This kit handles everything from local archives to cloud mailboxes in one smooth process.");
        p4.setCategory("mgu-migration");
        PricingTier p4t1 = new PricingTier("Pro", 99.0, null, "license", Arrays.asList("Unlimited Data", "24/7 Phone Support"), "Go to Cloud", null, false);
        p4.setPricing(Arrays.asList(p4t1));

        Product p5 = new Product();
        p5.setId("uncle-mbox-to-pst");
        p5.setSlug("mbox-to-pst-converter");
        p5.setName("MBOX to PST Converter");
        p5.setShortDescription("Convert Apple Mail and Thunderbird files to Outlook.");
        p5.setDescription("Switching from Mac to PC? Or Thunderbird to Outlook? This tool converts your MBOX files to PST format flawlessly.");
        p5.setCategory("mgu-converter");
        PricingTier p5t1 = new PricingTier("Basic", 39.0, null, "license", Arrays.asList("Fast Conversion", "No Size Limits"), "Buy Now", null, false);
        p5.setPricing(Arrays.asList(p5t1));

        Product p6 = new Product();
        p6.setId("uncle-email-backup-pro");
        p6.setSlug("email-backup-pro");
        p6.setName("Email Backup Pro");
        p6.setShortDescription("Automated, secure backups for your IMAP or Exchange mailboxes.");
        p6.setDescription("Never lose an email again. Set it and forget it. Email Backup Pro takes daily snapshots of your mailboxes to local storage.");
        p6.setCategory("mgu-backup");
        PricingTier p6t1 = new PricingTier("Annual", 49.0, null, "subscription", Arrays.asList("Daily Backups", "AES-256 Encryption"), "Subscribe", null, false);
        p6.setPricing(Arrays.asList(p6t1));

        Product p7 = new Product();
        p7.setId("uncle-eml-viewer");
        p7.setSlug("eml-viewer-free");
        p7.setName("EML Viewer (Free)");
        p7.setShortDescription("A simple utility to view standalone .eml files.");
        p7.setDescription("Someone sent you an EML file and you don't have an email client installed? Use our free viewer to read the email and extract attachments.");
        p7.setCategory("mgu-utility");
        PricingTier p7t1 = new PricingTier("Free", 0.0, null, "free", Arrays.asList("View EMLs", "Extract Attachments"), "Download Free", null, false);
        p7.setPricing(Arrays.asList(p7t1));

        Product p8 = new Product();
        p8.setId("uncle-ost-to-pst");
        p8.setSlug("ost-to-pst-converter");
        p8.setName("OST to PST Converter");
        p8.setShortDescription("Convert healthy OST files to portable PST format.");
        p8.setDescription("Need to backup your Exchange cache or move it to another machine? Convert it to PST easily with this tool.");
        p8.setCategory("mgu-converter");
        PricingTier p8t1 = new PricingTier("Standard", 39.0, null, "license", Arrays.asList("Batch Conversion", "High Speed"), "Buy Now", null, false);
        p8.setPricing(Arrays.asList(p8t1));
        
        productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8));

        // 3. FAQs
        List<Faq> faqs = new ArrayList<>();
        
        Faq f1 = new Faq();
        f1.setId("faq-mgu-1");
        f1.setQuestion("I am not very good with computers. Is this hard to use?");
        f1.setAnswer("Not at all! We designed all of our tools to be as simple as possible. Plus, our friendly support team is always here to help you step-by-step.");
        f1.setCategory("General");
        f1.setSiteId("migrationuncle");
        f1.setProductIds(Arrays.asList("uncle-pst-to-gmail", "uncle-cloud-migration-kit"));
        faqs.add(f1);

        Faq f2 = new Faq();
        f2.setId("faq-mgu-2");
        f2.setQuestion("Will this delete my original emails?");
        f2.setAnswer("No way! We only read your original files and create copies in the new location. Your original data is always perfectly safe.");
        f2.setCategory("Safety");
        f2.setSiteId("migrationuncle");
        f2.setProductIds(Arrays.asList("uncle-pst-to-gmail", "uncle-duplicate-cleaner", "uncle-cloud-migration-kit"));
        faqs.add(f2);
        
        Faq f3 = new Faq();
        f3.setId("faq-mgu-3");
        f3.setQuestion("What if the tool doesn't work for me?");
        f3.setAnswer("We want you to be happy. If our tool doesn't solve your problem and we can't help fix it, we'll give you a full refund within 30 days.");
        f3.setCategory("General");
        f3.setSiteId("migrationuncle");
        f3.setProductIds(Arrays.asList("uncle-pst-to-gmail", "uncle-ost-recovery", "uncle-mbox-to-pst"));
        faqs.add(f3);

        Faq f4 = new Faq();
        f4.setId("faq-mgu-4");
        f4.setQuestion("How fast is the conversion process?");
        f4.setAnswer("It depends on your file size, but our tools are highly optimized. Typically, it can process 1GB of data in just a few minutes.");
        f4.setCategory("Performance");
        f4.setSiteId("migrationuncle");
        f4.setProductIds(Arrays.asList("uncle-mbox-to-pst", "uncle-ost-to-pst"));
        faqs.add(f4);

        Faq f5 = new Faq();
        f5.setId("faq-mgu-5");
        f5.setQuestion("Does Duplicate Cleaner delete emails permanently?");
        f5.setAnswer("By default, it moves duplicates to a 'Deleted Items' folder so you can review them. You can configure it to permanently delete if you prefer.");
        f5.setCategory("Features");
        f5.setSiteId("migrationuncle");
        f5.setProductIds(Arrays.asList("uncle-duplicate-cleaner"));
        faqs.add(f5);

        Faq f6 = new Faq();
        f6.setId("faq-mgu-6");
        f6.setQuestion("Can it recover emails that were permanently deleted?");
        f6.setAnswer("The OST Recovery tool can sometimes recover 'hard-deleted' items if the space hasn't been overwritten in the file yet.");
        f6.setCategory("Features");
        f6.setSiteId("migrationuncle");
        f6.setProductIds(Arrays.asList("uncle-ost-recovery"));
        faqs.add(f6);

        Faq f7 = new Faq();
        f7.setId("faq-mgu-7");
        f7.setQuestion("Where are my backups stored?");
        f7.setAnswer("Email Backup Pro stores your backups locally on your computer or any external hard drive you specify. We don't keep your data on our servers.");
        f7.setCategory("Privacy");
        f7.setSiteId("migrationuncle");
        f7.setProductIds(Arrays.asList("uncle-email-backup-pro"));
        faqs.add(f7);

        Faq f8 = new Faq();
        f8.setId("faq-mgu-8");
        f8.setQuestion("Is the EML Viewer actually free?");
        f8.setAnswer("Yes! 100% free, no ads, no hidden costs. It's our way of helping out the community.");
        f8.setCategory("Pricing");
        f8.setSiteId("migrationuncle");
        f8.setProductIds(Arrays.asList("uncle-eml-viewer"));
        faqs.add(f8);

        Faq f9 = new Faq();
        f9.setId("faq-mgu-9");
        f9.setQuestion("Does it maintain folder hierarchy?");
        f9.setAnswer("Absolutely. The cloud migration kit accurately maps your local folder structure directly to your cloud mailbox.");
        f9.setCategory("Features");
        f9.setSiteId("migrationuncle");
        f9.setProductIds(Arrays.asList("uncle-cloud-migration-kit", "uncle-pst-to-gmail"));
        faqs.add(f9);

        Faq f10 = new Faq();
        f10.setId("faq-mgu-10");
        f10.setQuestion("Can I install this on a Mac?");
        f10.setAnswer("Currently, our tools are designed for Windows operating systems (Windows 10 and 11).");
        f10.setCategory("Compatibility");
        f10.setSiteId("migrationuncle");
        f10.setProductIds(Arrays.asList("uncle-pst-to-gmail", "uncle-mbox-to-pst"));
        faqs.add(f10);

        faqRepository.saveAll(faqs);

        // 4. Guides (Help Articles)
        List<HelpArticle> guides = new ArrayList<>();

        HelpArticle h1 = new HelpArticle();
        h1.setId("help-mgu-1");
        h1.setSiteId("migrationuncle");
        h1.setSlug("how-to-find-pst-file");
        h1.setTitle("How to find your Outlook PST file");
        h1.setContent("If you're not sure where Outlook keeps your data, don't worry! Open Outlook, go to File > Account Settings, and click the Data Files tab. The location of your file is listed right there.");
        h1.setCategory("Getting Started");
        h1.setTags(Arrays.asList("Outlook","PST","Beginner"));
        h1.setProductIds(Arrays.asList("uncle-pst-to-gmail"));
        guides.add(h1);

        HelpArticle h2 = new HelpArticle();
        h2.setId("help-mgu-2");
        h2.setSiteId("migrationuncle");
        h2.setSlug("what-is-an-ost-file");
        h2.setTitle("What is an OST file anyway?");
        h2.setContent("An OST file is an 'Offline Storage Table'. It's basically a cached copy of your mailbox when you use an Exchange or IMAP account. It lets you read your mail even when your internet is down.");
        h2.setCategory("Learning");
        h2.setTags(Arrays.asList("OST","Information"));
        h2.setProductIds(Arrays.asList("uncle-ost-recovery", "uncle-ost-to-pst"));
        guides.add(h2);

        HelpArticle h3 = new HelpArticle();
        h3.setId("help-mgu-3");
        h3.setSiteId("migrationuncle");
        h3.setSlug("preventing-duplicate-emails");
        h3.setTitle("How to prevent duplicate emails in the future");
        h3.setContent("Duplicates often happen when you drag and drop folders incorrectly or sync the same account on multiple devices improperly. Always use IMAP instead of POP3!");
        h3.setCategory("Best Practices");
        h3.setTags(Arrays.asList("Clean Inbox","Tips"));
        h3.setProductIds(Arrays.asList("uncle-duplicate-cleaner"));
        guides.add(h3);

        HelpArticle h4 = new HelpArticle();
        h4.setId("help-mgu-4");
        h4.setSiteId("migrationuncle");
        h4.setSlug("best-backup-strategy");
        h4.setTitle("The 3-2-1 Backup Rule");
        h4.setContent("Keep 3 copies of your data, on 2 different media, with 1 offsite. Email Backup Pro can help you automate the local backups.");
        h4.setCategory("Learning");
        h4.setTags(Arrays.asList("Backup","Security"));
        h4.setProductIds(Arrays.asList("uncle-email-backup-pro"));
        guides.add(h4);

        HelpArticle h5 = new HelpArticle();
        h5.setId("help-mgu-5");
        h5.setSiteId("migrationuncle");
        h5.setSlug("exporting-from-thunderbird");
        h5.setTitle("Exporting your mail from Mozilla Thunderbird");
        h5.setContent("Thunderbird uses the MBOX format. You can find your profile folder by clicking Help > Troubleshooting Information > Open Folder.");
        h5.setCategory("Getting Started");
        h5.setTags(Arrays.asList("MBOX","Thunderbird"));
        h5.setProductIds(Arrays.asList("uncle-mbox-to-pst"));
        guides.add(h5);

        HelpArticle h6 = new HelpArticle();
        h6.setId("help-mgu-6");
        h6.setSiteId("migrationuncle");
        h6.setSlug("migrating-to-office-365");
        h6.setTitle("Checklist for Migrating to Office 365");
        h6.setContent("Make sure you have your admin credentials, list of mailboxes, and inform your users about the downtime before starting the migration.");
        h6.setCategory("Migration");
        h6.setTags(Arrays.asList("Cloud","O365"));
        h6.setProductIds(Arrays.asList("uncle-cloud-migration-kit"));
        guides.add(h6);

        helpArticleRepository.saveAll(guides);
    }

    private void seedMigrationUncleCareerPositions() {
        List<CareerPosition> positions = new ArrayList<>();

        CareerPosition cp1 = new CareerPosition();
        cp1.setId("support-mgu");
        cp1.setSiteId("migrationuncle");
        cp1.setTitle("Friendly Support Agent");
        cp1.setLocation("Remote (US Only)");
        cp1.setType("Full-time");
        cp1.setDescription("We're looking for patient, kind, and tech-savvy individuals to help our customers with their migrations.");
        cp1.setRequirements("- Incredible patience and empathy\n- Good typing speed\n- Basic knowledge of Windows and Outlook");
        cp1.setStatus("OPEN");
        positions.add(cp1);

        CareerPosition cp2 = new CareerPosition();
        cp2.setId("dev-mgu-1");
        cp2.setSiteId("migrationuncle");
        cp2.setTitle("Software Engineer (.NET)");
        cp2.setLocation("Austin, TX / Remote");
        cp2.setType("Full-time");
        cp2.setDescription("Help us build fast, reliable, and easy-to-use data parsing tools.");
        cp2.setRequirements("- 3+ years of C# / .NET experience\n- Experience with binary file parsing\n- Passion for clean code");
        cp2.setStatus("OPEN");
        positions.add(cp2);

        CareerPosition cp3 = new CareerPosition();
        cp3.setId("marketing-mgu-1");
        cp3.setSiteId("migrationuncle");
        cp3.setTitle("Content Writer");
        cp3.setLocation("Remote");
        cp3.setType("Part-time");
        cp3.setDescription("Write friendly, non-jargon articles explaining complex tech topics to home users.");
        cp3.setRequirements("- Excellent English writing skills\n- Ability to simplify technical concepts\n- SEO knowledge is a plus");
        cp3.setStatus("OPEN");
        positions.add(cp3);

        CareerPosition cp4 = new CareerPosition();
        cp4.setId("qa-mgu-1");
        cp4.setSiteId("migrationuncle");
        cp4.setTitle("QA Tester");
        cp4.setLocation("Remote");
        cp4.setType("Contract");
        cp4.setDescription("Break our software before our customers do!");
        cp4.setRequirements("- Keen eye for detail\n- Experience setting up virtual machines\n- Familiarity with different email clients");
        cp4.setStatus("OPEN");
        positions.add(cp4);

        careerPositionRepository.saveAll(positions);
    }

    private void seedMigrationUncleClients() {
        List<ClientLogo> clients = new ArrayList<>();
        
        ClientLogo cl1 = new ClientLogo();
        cl1.setId("mgu-client-1");
        cl1.setSiteId("migrationuncle");
        cl1.setCompanyName("Bob's Plumbing");
        cl1.setLogoUrl("/logos/bobs-plumbing.svg");
        clients.add(cl1);

        ClientLogo cl2 = new ClientLogo();
        cl2.setId("mgu-client-2");
        cl2.setSiteId("migrationuncle");
        cl2.setCompanyName("Main Street Bakery");
        cl2.setLogoUrl("/logos/main-st-bakery.svg");
        clients.add(cl2);

        ClientLogo cl3 = new ClientLogo();
        cl3.setId("mgu-client-3");
        cl3.setSiteId("migrationuncle");
        cl3.setCompanyName("Greenfield Accounting");
        cl3.setLogoUrl("/logos/greenfield.svg");
        clients.add(cl3);

        ClientLogo cl4 = new ClientLogo();
        cl4.setId("mgu-client-4");
        cl4.setSiteId("migrationuncle");
        cl4.setCompanyName("Local Tech Support Co.");
        cl4.setLogoUrl("/logos/local-tech.svg");
        clients.add(cl4);

        clientLogoRepository.saveAll(clients);
    }
    
    private void seedSiteSettingsForApexByte() {
        SiteSetting setting = new SiteSetting();
        setting.setId("settings-apexbyte");
        setting.setSiteId("apexbyte");
        setting.setName("ApexByte Soft");
        setting.setTagline("Precision Software for Modern IT Teams");
        setting.setDescription("Enterprise-grade migration, conversion, and data management tools built for speed, security, and scalability.");
        setting.setUrl("https://apexbyte.local");
        setting.setEmail("support@apexbyte.local");
        setting.setPhone("+1 (800) 123-4567");
        setting.setAddress("ApexByte HQ");
        
        setting.setSocials(new SiteSetting.Socials(
            "https://twitter.com/apexbyte",
            "https://linkedin.com/company/apexbyte",
            "https://youtube.com/@apexbyte",
            "https://facebook.com/apexbyte",
            "https://github.com/apexbyte"
        ));

        setting.setStats(java.util.Arrays.asList(
            new SiteSetting.StatItem("500K+", "Downloads"),
            new SiteSetting.StatItem("10K+", "Happy Users"),
            new SiteSetting.StatItem("4.8★", "Avg Rating"),
            new SiteSetting.StatItem("99.9%", "Success Rate")
        ));
        
        setting.setTrustBadges(java.util.Arrays.asList(
            new SiteSetting.TrustBadge("🛡️", "Secure & Safe", "256-bit SSL encryption.", "text-green-600 bg-green-50")
        ));

        setting.setMainNavigation(java.util.Arrays.asList(
            new SiteSetting.NavItem("Products", "#", null, true, java.util.Arrays.asList(
                new SiteSetting.NavItem("Email Migration", "/products?category=email-migration", null, true, null),
                new SiteSetting.NavItem("File Converters", "/products?category=file-converters", null, true, null)
            )),
            new SiteSetting.NavItem("Pricing", "/pricing", null, true, null),
            new SiteSetting.NavItem("Careers", "/careers", null, true, null),
            new SiteSetting.NavItem("Contact", "/contact", null, true, null)
        ));

        siteSettingRepository.save(setting);
    }

    private void seedApexByteCatalog(String brand) {


        // Category
        Category c1 = new Category();
        c1.setId("cat-apexbyte-1");
        c1.setLabel("Email Migration");
        c1.setDescription("Enterprise mail migration tools.");
        c1.setSlug("email");
        c1.setIcon("Mail");
        c1.setColor("#2563EB");
        c1.setSiteId(brand);
        categoryRepository.save(c1);

        Category c2 = new Category();
        c2.setId("cat-apexbyte-2");
        c2.setLabel("File Converters");
        c2.setDescription("Fastest file conversion utilities.");
        c2.setSlug("converters");
        c2.setIcon("FileText");
        c2.setColor("#0EA5E9");
        c2.setSiteId(brand);
        categoryRepository.save(c2);

        // Product 1
        Product p1 = new Product();
        p1.setId("prod-apexbyte-1");
        p1.setName("Apex PST to Gmail Converter");
        p1.setSlug("pst-to-gmail");
        p1.setVersion("5.1.0");
        p1.setEnabled(true);
        p1.setShortDescription("Quickly convert and migrate PST files to Gmail/G-Suite with enterprise-grade speed and accuracy.");
        p1.setDescription("<p>Apex PST to Gmail Converter is a corporate-grade utility designed to seamlessly upload local Outlook data files to Google Workspace. Engineered for speed and zero data loss.</p>");
        p1.setCategory(c1.getId());
        p1.setFeatures(List.of("Batch PST Migration", "Folder Hierarchy Retention", "Direct IMAP Upload", "Selective Date Range Migration"));
        p1.setPlatforms(List.of("Windows", "Mac"));
        p1.setSupportedFormats(List.of(".pst", ".ost"));
        p1.setRating(4.9);
        p1.setReviewCount(842);
        p1.setDownloads("120k+");
        p1.setSiteId(brand);

        List<PricingTier> pricing = List.of(
            new PricingTier("Standard License", 49.0, null, "Lifetime", List.of("1 Mailbox", "Standard Support"), "Buy Now", "1", false),
            new PricingTier("Corporate License", 149.0, null, "Lifetime", List.of("50 Mailboxes", "Priority Support"), "Buy Now", "50", true)
        );
        p1.setPricing(pricing);
        productRepository.save(p1);

        // Link categories
        c1.setProductIds(List.of(p1.getId()));
        categoryRepository.save(c1);

        // FAQ
        Faq f1 = new Faq();
        f1.setId("faq-apexbyte-1");
        f1.setProductId(p1.getId());
        f1.setProductIds(List.of(p1.getId()));
        f1.setQuestion("Does it maintain folder hierarchy?");
        f1.setAnswer("Yes, the tool preserves the exact folder structure of your PST file in Gmail.");
        f1.setCategory("Technical Support");
        f1.setSiteId(brand);
        faqRepository.save(f1);

        // Guide
        HelpArticle h1 = new HelpArticle();
        h1.setId("guide-apexbyte-1");
        h1.setProductId(p1.getId());
        h1.setProductIds(List.of(p1.getId()));
        h1.setSlug("pst-gmail-guide");
        h1.setTitle("How to Migrate PST to Gmail");
        h1.setExcerpt("Step by step guide for PST to Gmail migration.");
        h1.setContent("### 1. Add File\nLoad your PST file.\n\n### 2. Enter Credentials\nLog in to your Gmail.\n\n### 3. Convert\nClick convert to start the process.");
        h1.setCategory("Product Guide");
        h1.setSiteId(brand);
        helpArticleRepository.save(h1);

        System.out.println("✅ ApexByte Catalog injected.");
    }
}