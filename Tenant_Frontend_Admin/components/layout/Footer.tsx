import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Award, Users, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/nav";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-base">D</span>
              </div>
              <span className="font-bold text-white text-lg">
                Data<span className="text-blue-400">Migrate</span> Pro
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              {siteConfig.description}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                  <span className="text-green-400">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { href: siteConfig.socials.twitter, label: "Twitter", text: "X" },
                { href: siteConfig.socials.linkedin, label: "LinkedIn", text: "in" },
                { href: siteConfig.socials.youtube, label: "YouTube", text: "YT" },
                { href: siteConfig.socials.facebook, label: "Facebook", text: "f" },
              ].map(({ href, label, text }) => (
                <a
                  key={label}
                  href={href}
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
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-2.5">
              {footerNav.products.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                  View All →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerNav.support.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone size={14} className="mt-0.5 shrink-0 text-blue-400" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail size={14} className="mt-0.5 shrink-0 text-blue-400" />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-gray-400">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-blue-400" />
                  {siteConfig.address}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerNav.legal.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
