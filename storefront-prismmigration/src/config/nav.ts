export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Email Migration", href: "/products?category=email-migration" },
      { label: "Backup Tools", href: "/products?category=backup" },
      { label: "File Converters", href: "/products?category=file-converter" },
      { label: "Cloud Migration", href: "/products?category=cloud-migration" },
      { label: "Mailbox Recovery", href: "/products?category=mailbox-recovery" },
      { label: "Data Export/Import", href: "/products?category=data-export" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
  { label: "Compare", href: "/compare" },
  { label: "Blog", href: "/blog" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  products: [
    { label: "Email Migration", href: "/products?category=email-migration" },
    { label: "Backup Tools", href: "/products?category=backup" },
    { label: "File Converters", href: "/products?category=file-converter" },
    { label: "Cloud Migration", href: "/products?category=cloud-migration" },
    { label: "Mailbox Recovery", href: "/products?category=mailbox-recovery" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/about#careers" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Download Center", href: "/download" },
    { label: "Compare Tools", href: "/compare" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "License Agreement", href: "/license" },
  ],
};
