-- Seed lots of industry-standard email migration formats and features for brandA

-- SOURCE FORMATS
INSERT INTO source_formats (id, format_key, name, description, icon, site_id, supports_multiple_accounts) VALUES
('sf-pst-bA', 'pst', 'Outlook PST File', 'Microsoft Outlook Personal Storage Table (.pst)', 'mail', 'brandA', false),
('sf-ost-bA', 'ost', 'Outlook OST File', 'Microsoft Outlook Offline Storage Table (.ost)', 'mail', 'brandA', false),
('sf-mbox-bA', 'mbox', 'MBOX File', 'Standard Mailbox format (.mbox, .mbx)', 'mail', 'brandA', false),
('sf-eml-bA', 'eml', 'EML File', 'Individual Email Message (.eml)', 'mail', 'brandA', false),
('sf-emlx-bA', 'emlx', 'EMLX File', 'Apple Mail Message format (.emlx)', 'mail', 'brandA', false),
('sf-msg-bA', 'msg', 'MSG File', 'Outlook Message format (.msg)', 'mail', 'brandA', false),
('sf-nsf-bA', 'nsf', 'Lotus Notes NSF File', 'HCL/IBM Lotus Notes Database (.nsf)', 'mail', 'brandA', false),
('sf-edb-bA', 'edb', 'Exchange EDB File', 'Microsoft Exchange Server Database (.edb)', 'server', 'brandA', true),
('sf-olm-bA', 'olm', 'Mac Outlook OLM File', 'Outlook for Mac Archive (.olm)', 'mail', 'brandA', false),
('sf-dbx-bA', 'dbx', 'Outlook Express DBX File', 'Outlook Express Folder (.dbx)', 'mail', 'brandA', false),
('sf-gmail-bA', 'gmail', 'Gmail Account', 'Direct extraction from Google Mail', 'cloud', 'brandA', true),
('sf-gws-bA', 'google_workspace', 'Google Workspace', 'Google Workspace / G Suite accounts', 'cloud', 'brandA', true),
('sf-o365-bA', 'office365', 'Office 365', 'Microsoft 365 Cloud Accounts', 'cloud', 'brandA', true),
('sf-exchange-bA', 'exchange', 'Exchange Server', 'On-Premises Microsoft Exchange Server', 'server', 'brandA', true),
('sf-imap-bA', 'imap', 'IMAP Server', 'Any standard IMAP-compatible email server', 'server', 'brandA', true),
('sf-yahoo-bA', 'yahoo', 'Yahoo Mail', 'Yahoo Mail accounts via IMAP/API', 'cloud', 'brandA', true),
('sf-zimbra-bA', 'zimbra', 'Zimbra TGZ File', 'Zimbra Desktop/Server Archive (.tgz)', 'mail', 'brandA', false)
ON CONFLICT (format_key, site_id) DO NOTHING;

-- TARGET FORMATS
INSERT INTO target_formats (id, format_key, name, description, icon, site_id, supports_multiple_accounts) VALUES
('tf-pst-bA', 'pst', 'Outlook PST File', 'Export to Microsoft Outlook PST', 'mail', 'brandA', false),
('tf-mbox-bA', 'mbox', 'MBOX File', 'Export to standard MBOX format', 'mail', 'brandA', false),
('tf-eml-bA', 'eml', 'EML File', 'Export to EML messages', 'mail', 'brandA', false),
('tf-msg-bA', 'msg', 'MSG File', 'Export to Outlook MSG files', 'mail', 'brandA', false),
('tf-pdf-bA', 'pdf', 'PDF Document', 'Export emails as PDF documents', 'file', 'brandA', false),
('tf-html-bA', 'html', 'HTML File', 'Export emails as HTML files', 'file', 'brandA', false),
('tf-rtf-bA', 'rtf', 'RTF File', 'Rich Text Format', 'file', 'brandA', false),
('tf-csv-bA', 'csv', 'CSV File', 'Comma Separated Values for Contacts/Tables', 'file', 'brandA', false),
('tf-vcf-bA', 'vcf', 'vCard / VCF', 'Export contacts as vCard', 'contact', 'brandA', false),
('tf-ics-bA', 'ics', 'ICS File', 'Export calendar events', 'calendar', 'brandA', false),
('tf-gmail-bA', 'gmail', 'Gmail Account', 'Direct import into Gmail', 'cloud', 'brandA', true),
('tf-gws-bA', 'google_workspace', 'Google Workspace', 'Direct import into Google Workspace', 'cloud', 'brandA', true),
('tf-o365-bA', 'office365', 'Office 365', 'Direct import into Microsoft 365', 'cloud', 'brandA', true),
('tf-exchange-bA', 'exchange', 'Exchange Server', 'Import into Exchange Server', 'server', 'brandA', true),
('tf-imap-bA', 'imap', 'IMAP Server', 'Import via IMAP protocol', 'server', 'brandA', true)
ON CONFLICT (format_key, site_id) DO NOTHING;

-- SUPPORTED CLIENTS
INSERT INTO supported_clients (id, client_key, name, description, icon, site_id) VALUES
('sc-outlook-bA', 'outlook', 'Microsoft Outlook', 'Supports Outlook 2021, 2019, 2016, 2013, 2010, 2007', 'mail', 'brandA'),
('sc-thunderbird-bA', 'thunderbird', 'Mozilla Thunderbird', 'Supports all versions of Mozilla Thunderbird', 'mail', 'brandA'),
('sc-applemail-bA', 'applemail', 'Apple Mail', 'Built-in macOS email client', 'mail', 'brandA'),
('sc-wlm-bA', 'windows_live_mail', 'Windows Live Mail', 'Legacy Windows email client', 'mail', 'brandA'),
('sc-emclient-bA', 'emclient', 'eM Client', 'Modern email client for Windows/Mac', 'mail', 'brandA'),
('sc-mailbird-bA', 'mailbird', 'Mailbird', 'Desktop email client for Windows', 'mail', 'brandA'),
('sc-postbox-bA', 'postbox', 'Postbox', 'Desktop email client', 'mail', 'brandA'),
('sc-thebat-bA', 'thebat', 'The Bat!', 'Secure desktop email client', 'mail', 'brandA'),
('sc-entourage-bA', 'entourage', 'Microsoft Entourage', 'Legacy Mac email client', 'mail', 'brandA'),
('sc-eudora-bA', 'eudora', 'Eudora', 'Classic email client', 'mail', 'brandA'),
('sc-lotus-bA', 'lotus_notes', 'Lotus Notes / HCL Notes', 'Enterprise email and collaboration', 'mail', 'brandA'),
('sc-zimbra-bA', 'zimbra', 'Zimbra Desktop', 'Open-source email client', 'mail', 'brandA')
ON CONFLICT (client_key, site_id) DO NOTHING;

-- KEY FEATURES
INSERT INTO key_features (id, feature_key, name, description, site_id) VALUES
('kf-batch-bA', 'supportsBatchMigration', 'Batch Migration', 'Migrate multiple mailboxes or files simultaneously to save time', 'brandA'),
('kf-incremental-bA', 'supportsIncremental', 'Incremental Sync', 'Migrate only new or modified items on subsequent runs to prevent duplicates', 'brandA'),
('kf-folder-filter-bA', 'supportsFolderFilter', 'Folder Selection', 'Select specific folders (Inbox, Sent, Drafts) to include or exclude', 'brandA'),
('kf-date-filter-bA', 'supportsDateFilter', 'Date Range Filter', 'Migrate emails falling within a specific date range', 'brandA'),
('kf-impersonation-bA', 'supportsImpersonation', 'Admin Impersonation', 'Use admin credentials to migrate multiple user accounts seamlessly', 'brandA'),
('kf-hierarchy-bA', 'preservesHierarchy', 'Preserve Hierarchy', 'Maintains the exact folder and subfolder structure during migration', 'brandA'),
('kf-csv-mapping-bA', 'supportsCsvMapping', 'CSV Mapping', 'Map source and destination accounts automatically using a CSV file', 'brandA'),
('kf-split-pst-bA', 'supportsSplitPst', 'Split Large Files', 'Automatically split oversized output PST files by size (GB/MB)', 'brandA'),
('kf-remove-dupes-bA', 'removesDuplicates', 'Remove Duplicates', 'Detect and skip duplicate emails based on To, From, Subject, and Date', 'brandA'),
('kf-extract-attachments-bA', 'extractsAttachments', 'Extract Attachments', 'Option to extract attachments separately to a local folder', 'brandA'),
('kf-preview-bA', 'supportsPreview', 'Preview Mode', 'Preview emails and attachments within the software before migration', 'brandA'),
('kf-reports-bA', 'generatesReports', 'Detailed Reports', 'Generates detailed CSV/HTML migration logs for compliance and auditing', 'brandA'),
('kf-contacts-cals-bA', 'migratesContactsCals', 'Contacts & Calendars', 'Migrates address books, distribution lists, and calendar events intact', 'brandA')
ON CONFLICT (feature_key, site_id) DO NOTHING;

