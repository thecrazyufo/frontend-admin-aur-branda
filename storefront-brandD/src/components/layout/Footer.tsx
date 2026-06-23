import { Mail, Phone, MapPin, Shield, Award, Users } from "lucide-react";

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

// Default footer links — used when no footerConfig is provided from the API
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
    { label: "Contact", href: "/contact" },
  ],
  supportLinks: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Download Center", href: "/download" },
    { label: "Compare Tools", href: "/compare" },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "License Agreement", href: "/license" },
  ],
};

export default function Footer({
  siteName = "",
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

  // Dynamic admin login URL — use current host rather than hardcoded localhost
  const adminLoginUrl = typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
    : "/admin/login";

  const trustBadges = [
    { icon: <Shield size={16} />, text: "SSL Secured" },
    { icon: <Award size={16} />, text: "ISO Certified" },
    { icon: <Users size={16} />, text: "1M+ Users" },
  ];

  return (
    <footer className="bg-[var(--navy-950)] text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-base">{siteName.charAt(0) || "S"}</span>
              </div>
              <span className="font-bold text-white text-lg">
                {siteName}
              </span>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              {description}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {trustBadges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1.5 border border-white/10"
                >
                  <span className="text-green-400">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { href: socialsToUse.twitter, label: "Twitter", text: "X" },
                { href: socialsToUse.linkedin, label: "LinkedIn", text: "in" },
                { href: socialsToUse.youtube, label: "YouTube", text: "YT" },
                { href: socialsToUse.facebook, label: "Facebook", text: "f" },
              ].filter(s => s.href).map(({ href, label, text }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all text-xs font-bold"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          {links.productLinks && links.productLinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Products</h3>
              <ul className="space-y-2.5">
                {links.productLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/products" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                    View All →
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Company */}
          {links.companyLinks && links.companyLinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2.5">
                {links.companyLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          {links.supportLinks && links.supportLinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-2.5">
                {links.supportLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <Phone size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    {email}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <div className="flex items-start gap-2.5 text-sm text-gray-400">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    {address}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {(links.legalLinks || []).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href={adminLoginUrl}
              className="text-xs text-gray-400 hover:text-indigo-400 font-semibold transition-colors flex items-center gap-1"
            >
              🔒 Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
