import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Search, Download, Phone } from "lucide-react";

export interface NavItemData {
  label: string;
  href: string;
  enabled?: boolean;
  children?: NavItemData[];
}

interface NavbarProps {
  siteName?: string;
  phone?: string;
  navigation?: NavItemData[];
  logoUrl?: string;
  adminUrl?: string;
}

export default function Navbar({ siteName = "", phone = "", navigation = [], logoUrl, adminUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Filter to only enabled items
  const navItems = navigation.filter(item => item.enabled !== false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Check if the admin_jwt cookie is present
    const hasAdminJwt = document.cookie.split(';').some((item) => item.trim().startsWith('admin_jwt='));
    setIsAdminLoggedIn(hasAdminJwt);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resolve admin portal URL — prefer prop, then env, then fallback
  const resolvedAdminUrl = adminUrl || 
    (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3000/` : "/admin");

  return (
    <>
      {/* Top bar */}
      <div className="bg-[var(--navy-900)] text-gray-300 text-sm py-2 hidden md:block">
        <div className="container-custom flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone size={13} />
            {phone}
          </span>
          <div className="flex items-center gap-6">
            <span>30-Day Money-Back Guarantee</span>
            <span>•</span>
            <span>Free Trial Available</span>
            <span>•</span>
            <a href="/contact" className="text-amber-400 hover:text-amber-300 font-medium">
              24/7 Support
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-9 h-9 rounded-lg object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-base">{siteName.charAt(0) || "S"}</span>
                </div>
              )}
              <div>
                <span className="font-bold text-gray-900 text-lg leading-none">
                  {siteName}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeDropdown === item.label
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${activeDropdown === item.label ? "rotate-180" : ""}`}
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="/search"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  ⚙️ Admin Portal
                </a>
              )}
              <a href="/download" className="btn btn-outline text-sm py-2 px-4">
                <Download size={15} />
                Free Trial
              </a>
              <a href="/products" className="btn btn-primary text-sm py-2 px-4">
                View Products
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
                {item.children && (
                  <div className="ml-4 border-l-2 border-blue-100 pl-3 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-xs text-gray-500 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  ⚙️ Admin Portal
                </a>
              )}
              <a href="/download" className="btn btn-outline w-full justify-center">
                <Download size={15} />
                Free Trial
              </a>
              <a href="/products" className="btn btn-primary w-full justify-center">
                View Products
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
