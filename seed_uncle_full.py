import re

with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'r') as f:
    content = f.read()

new_content = """
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
        cp1.setRequirements("- Incredible patience and empathy\\n- Good typing speed\\n- Basic knowledge of Windows and Outlook");
        cp1.setStatus("OPEN");
        positions.add(cp1);

        CareerPosition cp2 = new CareerPosition();
        cp2.setId("dev-mgu-1");
        cp2.setSiteId("migrationuncle");
        cp2.setTitle("Software Engineer (.NET)");
        cp2.setLocation("Austin, TX / Remote");
        cp2.setType("Full-time");
        cp2.setDescription("Help us build fast, reliable, and easy-to-use data parsing tools.");
        cp2.setRequirements("- 3+ years of C# / .NET experience\\n- Experience with binary file parsing\\n- Passion for clean code");
        cp2.setStatus("OPEN");
        positions.add(cp2);

        CareerPosition cp3 = new CareerPosition();
        cp3.setId("marketing-mgu-1");
        cp3.setSiteId("migrationuncle");
        cp3.setTitle("Content Writer");
        cp3.setLocation("Remote");
        cp3.setType("Part-time");
        cp3.setDescription("Write friendly, non-jargon articles explaining complex tech topics to home users.");
        cp3.setRequirements("- Excellent English writing skills\\n- Ability to simplify technical concepts\\n- SEO knowledge is a plus");
        cp3.setStatus("OPEN");
        positions.add(cp3);

        CareerPosition cp4 = new CareerPosition();
        cp4.setId("qa-mgu-1");
        cp4.setSiteId("migrationuncle");
        cp4.setTitle("QA Tester");
        cp4.setLocation("Remote");
        cp4.setType("Contract");
        cp4.setDescription("Break our software before our customers do!");
        cp4.setRequirements("- Keen eye for detail\\n- Experience setting up virtual machines\\n- Familiarity with different email clients");
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
}
"""

start_idx = content.find("    private void seedMigrationUncleCatalog() {")
if start_idx != -1:
    patched = content[:start_idx] + new_content
    with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'w') as f:
        f.write(patched)
    print("Patched DevDatabaseSeeder.java successfully.")
else:
    print("Could not find seedMigrationUncleCatalog().")

