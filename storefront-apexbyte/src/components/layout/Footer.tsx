import { Mail, Phone, MapPin, Shield, CheckCircle, Award, Zap } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterConfigData {
  productLinks?: FooterLink[];
  companyLinks?: FooterLink[];
  supportLinks?: FooterLink[];
  legalLinks?: FooterLink[];
}

interface FooterProps {
  siteName?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    github?: string;
  };
  footerConfig?: FooterConfigData;
}

const defaultFooterLinks: FooterConfigData = {
  productLinks: [
    { label: "Email Migration", href: "/products?category=email-migration" },
    { label: "Backup Tools", href: "/products?category=backup" },
    { label: "File Converters", href: "/products?category=file-converter" },
    { label: "Cloud Migration", href: "/products?category=cloud-migration" },
    { label: "Mailbox Recovery", href: "/products?category=mailbox-recovery" },
  ],
  companyLinks: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
    { label: "Careers", href: "/about#careers" },
  ],
  supportLinks: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Download Center", href: "/download" },
    { label: "Compare Tools", href: "/compare" },
    { label: "Licensing", href: "/licensing" },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "License Agreement", href: "/license" },
  ],
};

export default function Footer({
  siteName = "ApexByte Soft",
  description = "",
  phone = "",
  email = "",
  address = "",
  socials,
  footerConfig,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const links = footerConfig || defaultFooterLinks;
  const socialsToUse = socials || {};

  const adminLoginUrl = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_ADMIN_URL)
    ? `${import.meta.env.PUBLIC_ADMIN_URL}/admin/login`
    : (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
      : "http://localhost:3000/admin/login");

  const trustBadges = [
    { icon: <Shield size={14} />, text: "SSL Encrypted" },
    { icon: <CheckCircle size={14} />, text: "ISO 27001" },
    { icon: <Award size={14} />, text: "Verified Secure" },
  ];

  const socialList = [
    { href: socialsToUse.twitter, label: "X (Twitter)", abbr: "X" },
    { href: socialsToUse.linkedin, label: "LinkedIn", abbr: "in" },
    { href: socialsToUse.youtube, label: "YouTube", abbr: "YT" },
    { href: socialsToUse.facebook, label: "Facebook", abbr: "f" },
    { href: socialsToUse.github, label: "GitHub", abbr: "GH" },
  ].filter((s) => s.href);

  return (
    <footer
      style={{ background: "var(--color-surface-2)", borderTop: "1px solid var(--color-border)" }}
    >
      {/* Main Footer Grid */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-apex-600)] flex items-center justify-center shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-blue)] group-hover:-translate-y-0.5 transition-all">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <div className="leading-none">
                <span className="font-extrabold text-[var(--color-text-primary)] text-[18px] tracking-tight">
                  ApexByte
                </span>
                <span className="font-semibold text-[var(--color-apex-600)] text-[18px] tracking-tight">
                  &nbsp;Soft
                </span>
              </div>
            </a>

            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6 max-w-xs">
              {description ||
                "Enterprise-grade data migration and management software trusted by IT professionals worldwide."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {trustBadges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] bg-white rounded-full px-3 py-1.5 border border-[var(--color-border)] font-medium"
                >
                  <span className="text-[var(--color-apex-600)]">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Social Links */}
            {socialList.length > 0 && (
              <div className="flex items-center gap-2">
                {socialList.map(({ href, label, abbr }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] hover:border-[var(--color-apex-300)] hover:bg-[var(--color-apex-50)] transition-all text-xs font-bold shadow-xs"
                  >
                    {abbr}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Products Column */}
          {links.productLinks && links.productLinks.length > 0 && (
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-widest mb-4">
                Products
              </h3>
              <ul className="space-y-2.5">
                {links.productLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] transition-colors font-medium"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/products"
                    className="text-sm text-[var(--color-apex-600)] hover:text-[var(--color-apex-700)] font-semibold"
                  >
                    View All →
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Company Column */}
          {links.companyLinks && links.companyLinks.length > 0 && (
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-2.5">
                {links.companyLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] transition-colors font-medium"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support Column */}
          {links.supportLinks && links.supportLinks.length > 0 && (
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-widest mb-4">
                Support
              </h3>
              <ul className="space-y-2.5">
                {links.supportLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] transition-colors font-medium"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Column */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-xs uppercase tracking-widest mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] transition-colors font-medium"
                  >
                    <Phone size={14} className="mt-0.5 shrink-0 text-[var(--color-apex-500)]" />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] transition-colors font-medium"
                  >
                    <Mail size={14} className="mt-0.5 shrink-0 text-[var(--color-apex-500)]" />
                    {email}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <div className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-apex-500)]" />
                    {address}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-faint)]">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {(links.legalLinks || []).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href={adminLoginUrl}
              className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-apex-600)] font-semibold transition-colors"
            >
              🔒 Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
