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

  const adminLoginUrl = typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
    : "/admin/login";

  return (
    <footer className="bg-white border-t border-[--color-hairline] pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-8 h-8 rounded-md bg-[--color-ink] flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-[--color-canvas] font-bold text-xs">{siteName.charAt(0) || "S"}</span>
              </div>
              <span className="font-semibold text-[--color-ink] tracking-tight">
                {siteName}
              </span>
            </a>
            <p className="text-[14px] text-[--color-body] leading-relaxed mb-6 max-w-xs">
              {description}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { href: socialsToUse.twitter, label: "Twitter", text: "X" },
                { href: socialsToUse.github, label: "GitHub", text: "Gh" },
                { href: socialsToUse.linkedin, label: "LinkedIn", text: "In" },
                { href: socialsToUse.youtube, label: "YouTube", text: "Yt" },
              ].filter(s => s.href).map(({ href, label, text }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-md bg-[rgba(0,0,0,0.03)] border border-[--color-hairline] flex items-center justify-center text-[--color-body] hover:text-[--color-ink] hover:bg-[rgba(0,0,0,0.06)] transition-all text-xs font-semibold"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          {links.productLinks && links.productLinks.length > 0 && (
            <div>
              <h3 className="text-[14px] font-medium text-[--color-ink] mb-4">Products</h3>
              <ul className="space-y-3">
                {links.productLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-[14px] text-[--color-body] hover:text-[--color-ink] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          {links.companyLinks && links.companyLinks.length > 0 && (
            <div>
              <h3 className="text-[14px] font-medium text-[--color-ink] mb-4">Company</h3>
              <ul className="space-y-3">
                {links.companyLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-[14px] text-[--color-body] hover:text-[--color-ink] transition-colors">
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
              <h3 className="text-[14px] font-medium text-[--color-ink] mb-4">Support</h3>
              <ul className="space-y-3">
                {links.supportLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-[14px] text-[--color-body] hover:text-[--color-ink] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[--color-hairline]">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[13px] text-[--color-mute]">
            <span>© {currentYear} {siteName}. All rights reserved.</span>
            
            <div className="hidden sm:block h-3 w-px bg-[--color-hairline]"></div>
            
            <div className="flex items-center gap-4">
              {(links.legalLinks || []).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-[--color-ink] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          <a
            href={adminLoginUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[--color-mute] hover:text-[--color-ink] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            <Shield size={12} />
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
