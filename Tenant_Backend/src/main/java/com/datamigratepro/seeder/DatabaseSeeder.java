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
public class DatabaseSeeder implements CommandLineRunner {

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
    private com.datamigratepro.service.BrandConfigService brandConfigService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            TenantContext.setCurrentTenant("system");
            adminUserRepository.deleteAll();
            adminUserRepository.saveAll(Arrays.asList(
                // Super Admin (legacy: OWNER) — global access
                new AdminUser("owner", passwordEncoder.encode("owner123"), "SUPER_ADMIN", "all", "Root Owner", "owner@platform.local"),
                // Brand A staff
                new AdminUser("adminA", passwordEncoder.encode("admin123"), "ADMIN", "brandA", "Brand A Administrator", "admin@brandA.local"),
                new AdminUser("staffA", passwordEncoder.encode("admin123"), "SEO_CW_PRODUCT_MANAGER", "brandA", "Brand A SEO & Product Staff", "staff@brandA.local"),
                // Brand B staff
                new AdminUser("adminB", passwordEncoder.encode("admin123"), "ADMIN", "brandB", "Brand B Administrator", "admin@brandB.local"),
                new AdminUser("staffB", passwordEncoder.encode("admin123"), "SEO_CW_PRODUCT_MANAGER", "brandB", "Brand B SEO & Product Staff", "staff@brandB.local")
            ));
            System.out.println("👤 Seeded initial administrator credentials in system database!");
        } finally {
            TenantContext.clear();
        }

        List<com.datamigratepro.entity.BrandConfig> brands = brandConfigService.getAllActiveBrands();
        for (com.datamigratepro.entity.BrandConfig brandConfig : brands) {
            String brand = brandConfig.getId();
            try {
                TenantContext.setCurrentTenant(brand);

                // Force clear brand-specific database tables to achieve a clean state reset
                categoryRepository.deleteAll();
                faqRepository.deleteAll();
                productRepository.deleteAll();
                blogPostRepository.deleteAll();
                helpArticleRepository.deleteAll();
                licenseKeyRepository.deleteAll();
                licenseRepository.deleteAll();
                siteSettingRepository.deleteAll();
                urlRedirectRepository.deleteAll();
                
                if ("brandA".equals(brand)) {
                    seedCategories();
                    seedFaqs();
                    seedProducts();
                    seedBlogPosts();
                    seedHelpArticles();
                    seedSiteSettingsForBrandA();
                    System.out.println("🌱 Database brandA successfully seeded with full platform catalog!");

                    seedLicenses();
                    System.out.println("🔑 Seeded initial active and testing license keys for brandA!");

                    licenseRepository.saveAll(createBrandLicenses("PST", "brandA"));
                    System.out.println("🔑 Seeded initial valid licenses for brandA!");
                } else {
                    seedBrandSpecificCatalog(brand);
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
        p1.setSeo(new Seo("Outlook to Gmail Migration Tool — Migrate PST to Gmail Instantly", "Transfer emails, contacts, and calendars from Outlook/PST files to Gmail or Google Workspace with 100% accuracy. Download free trial.", Arrays.asList("outlook to gmail migration", "pst to gmail", "migrate outlook to google workspace", "email migration tool")));
        productRepository.save(p1);

        // Product 2: Office 365 Backup
        Product p2 = new Product();
        p2.setId("2");
        p2.setSlug("office-365-backup-tool");
        p2.setName("Office 365 Backup Tool");
        p2.setShortDescription("Complete backup solution for Microsoft Office 365 — emails, OneDrive, SharePoint, and Teams data.");
        p2.setDescription("Protect your Microsoft 365 data with our comprehensive backup solution. Backup emails, contacts, calendars, OneDrive files, SharePoint sites, and Teams conversations. Restore individual items or full mailboxes in minutes.");
        p2.setCategory("backup");
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

    private SiteSetting createBrandASiteSetting() {
        SiteSetting defaultSetting = new SiteSetting();
        defaultSetting.setId("settings-brandA");
        defaultSetting.setSiteId("brandA");
        defaultSetting.setName("Brand A");
        defaultSetting.setTagline("Professional Software Tools for Data Migration & Management");
        defaultSetting.setDescription("Industry-leading email migration, backup, file conversion, and cloud migration tools trusted by 1M+ users worldwide.");
        defaultSetting.setUrl("https://brandA.com");
        defaultSetting.setEmail("support@brandA.com");
        defaultSetting.setPhone("+1 (800) 123-4567");
        defaultSetting.setAddress("123 Tech Park, San Francisco, CA 94107");

        defaultSetting.setSocials(new SiteSetting.Socials(
            "https://twitter.com/brandA",
            "https://linkedin.com/company/brandA",
            "https://youtube.com/@brandA",
            "https://facebook.com/brandA",
            "https://github.com/brandA"
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

        defaultSetting.setLegalPages(generateLegalPages("Brand A", "https://brandA.com", "support@brandA.com"));

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
}
