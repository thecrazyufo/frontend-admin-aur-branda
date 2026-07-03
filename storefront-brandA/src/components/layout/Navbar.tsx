import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Search, Download } from "lucide-react";

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

  const navItems = navigation.filter(item => item.enabled !== false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const hasAdminJwt = document.cookie.split(';').some((item) => item.trim().startsWith('admin_jwt='));
    setIsAdminLoggedIn(hasAdminJwt);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolvedAdminUrl = adminUrl || 
    (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3000/` : "/admin");

  return (
    <>
      {/* Vercel-style clean Navbar with backdrop blur and hairline border */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[rgba(255,255,255,0.7)] backdrop-blur-md border-[--color-hairline]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-7 h-7 rounded-md object-contain" />
              ) : (
                <div className="w-7 h-7 rounded-md bg-[--color-ink] flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-[--color-canvas] font-bold text-xs">{siteName.charAt(0) || "S"}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-[--color-ink] tracking-tight">
                  {siteName}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                      activeDropdown === item.label
                        ? "text-[--color-ink] bg-[rgba(0,0,0,0.04)]"
                        : "text-[--color-body] hover:text-[--color-ink] hover:bg-[rgba(0,0,0,0.04)]"
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform text-[--color-mute] ${activeDropdown === item.label ? "rotate-180 text-[--color-ink]" : ""}`}
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-[--color-canvas] rounded-lg shadow-lg border border-[--color-hairline] py-1.5 animate-fade-in">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-[14px] text-[--color-body] hover:text-[--color-ink] hover:bg-[rgba(0,0,0,0.02)] transition-colors"
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
                className="p-1.5 text-[--color-body] hover:text-[--color-ink] hover:bg-[rgba(0,0,0,0.04)] rounded-md transition-colors"
                aria-label="Search"
              >
                <Search size={16} />
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(0,0,0,0.05)] text-[--color-ink] rounded-md text-[13px] font-semibold hover:bg-[rgba(0,0,0,0.08)] transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin
                </a>
              )}
              <div className="h-4 w-px bg-[--color-hairline] mx-1"></div>
              <a href="/products" className="text-[14px] font-medium text-[--color-body] hover:text-[--color-ink] transition-colors">
                Contact
              </a>
              <a href="/download" className="btn btn-primary text-[13px] py-1.5 px-3 rounded-md">
                Deploy
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 text-[--color-body] hover:text-[--color-ink]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[--color-canvas] border-t border-[--color-hairline] px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2 text-[15px] font-medium text-[--color-ink] hover:bg-[rgba(0,0,0,0.04)] rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
                {item.children && (
                  <div className="ml-4 border-l border-[--color-hairline] pl-3 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-[14px] text-[--color-body] hover:text-[--color-ink]"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-[--color-hairline] mt-4">
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-[rgba(0,0,0,0.05)] text-[--color-ink] rounded-md text-[14px] font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin Portal
                </a>
              )}
              <a href="/download" className="btn btn-primary w-full justify-center">
                Deploy Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
