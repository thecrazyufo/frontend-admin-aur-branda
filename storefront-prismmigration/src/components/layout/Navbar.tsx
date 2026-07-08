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
  const [currentPath, setCurrentPath] = useState("");

  const baseNavItems = navigation.filter(item => item.enabled !== false);
  const navItems = baseNavItems.map(item => {
    if (item.label.toLowerCase() === "careers") {
      return { ...item, href: "/careers" };
    }
    if (item.label.toLowerCase().includes("clients")) {
      return { ...item, href: "/clients" };
    }
    return item;
  });

  const hasCareers = navItems.some(item => item.label.toLowerCase() === "careers");
  if (!hasCareers) {
    const pricingIdx = navItems.findIndex(item => item.label.toLowerCase() === "pricing");
    if (pricingIdx !== -1) {
      navItems.splice(pricingIdx + 1, 0, { label: "Careers", href: "/careers", enabled: true });
    } else {
      navItems.push({ label: "Careers", href: "/careers", enabled: true });
    }
  }

  const hasClients = navItems.some(item => item.label.toLowerCase().includes("clients"));
  if (!hasClients) {
    const careersIdx = navItems.findIndex(item => item.label.toLowerCase() === "careers");
    if (careersIdx !== -1) {
      navItems.splice(careersIdx + 1, 0, { label: "Our Clients", href: "/clients", enabled: true });
    } else {
      navItems.push({ label: "Our Clients", href: "/clients", enabled: true });
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const hasAdminJwt = document.cookie.split(';').some((item) => item.trim().startsWith('admin_jwt='));
    setIsAdminLoggedIn(hasAdminJwt);
    setCurrentPath(window.location.pathname);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolvedAdminUrl = adminUrl || 
    (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:3000/` : "/admin");

  return (
    <>
      {/* Vercel-style clean Navbar with backdrop blur, hairline border, and teal top accent */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-[#0F172A]/95 backdrop-blur-xl border-[#334155] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            : "bg-[#0A0F1A]/60 backdrop-blur-md border-[#1E2937]/60"
        }`}
      >
        {/* Teal top accent line on scroll */}
        <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#14B8A6]/60 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        <div className="container-custom">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-7 h-7 rounded-md object-contain" />
              ) : (
                <svg className="w-5 h-5 text-[#14B8A6] filter drop-shadow-[0_0_6px_rgba(20, 184, 166,0.8)] transition-transform group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                  <polygon points="50,15 15,80 85,80" />
                  <line x1="50" y1="15" x2="50" y2="80" strokeWidth="4" />
                </svg>
              )}
              <div>
                <span className="font-bold text-white tracking-tight text-lg group-hover:text-[#14B8A6] transition-colors">
                  {siteName || "Prism Migration"}
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
                    className={`relative flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      activeDropdown === item.label || currentPath === item.href
                        ? "text-[#14B8A6] bg-[#14B8A6]/8"
                        : "text-[#CBD5E1] hover:text-white hover:bg-[#1E2937]/50"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (item.children) {
                          e.preventDefault();
                          setActiveDropdown(activeDropdown === item.label ? null : item.label);
                        }
                      } else if (e.key === "Escape") {
                        setActiveDropdown(null);
                      }
                    }}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup={item.children ? "true" : undefined}
                    aria-current={currentPath === item.href ? "page" : undefined}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform text-[#64748B] ${activeDropdown === item.label ? "rotate-180 text-[#14B8A6]" : ""}`}
                      />
                    )}
                    {/* Active page dot indicator */}
                    {currentPath === item.href && !item.children && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#14B8A6]" />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-[#0F172A] rounded-lg shadow-lg border border-[#334155] py-1.5 animate-fade-in z-50">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-[14px] text-[#E2E8F0] hover:text-[#14B8A6] hover:bg-[#1E2937]/40 transition-colors focus-visible:outline-none focus-visible:bg-[#1E2937]/40 focus-visible:text-[#14B8A6]"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setActiveDropdown(null);
                            }
                          }}
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
                className="p-1.5 text-[#E2E8F0] hover:text-[#14B8A6] hover:bg-[#1E2937]/50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                aria-label="Search"
              >
                <Search size={16} />
              </a>
              <div className="h-4 w-px bg-[#334155] mx-1"></div>
              <a
                href="/find-your-tool"
                className="text-[13px] font-semibold text-[#14B8A6] hover:text-[#0D9488] bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 border border-[#14B8A6]/20 px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
              >
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2937] border border-[#334155] text-stone-100 rounded-md text-[13px] font-semibold hover:bg-stone-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin
                </a>
              )}
              <div className="h-4 w-px bg-[#334155] mx-1"></div>
              <a href="/products" className="text-[14px] font-medium text-[#E2E8F0] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]">
                Contact
              </a>
              <a href="/download" className="bg-[#14B8A6] hover:bg-[#0D9488] text-white font-extrabold text-[13px] py-1.5 px-3.5 rounded-md transition-all duration-300 shadow-[0_0_12px_rgba(20, 184, 166,0.25)] hover:shadow-[0_0_20px_rgba(20, 184, 166,0.5)] transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]">
                Deploy
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 text-[#E2E8F0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#0F172A]/95 backdrop-blur-md border-t border-[#334155] px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2 text-[15px] font-medium text-white hover:text-[#14B8A6] hover:bg-[#1E2937]/50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
                {item.children && (
                  <div className="ml-4 border-l border-[#334155] pl-3 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-[14px] text-[#E2E8F0] hover:text-[#14B8A6]"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-[#334155] mt-4">
              <a href="/find-your-tool" className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/25 hover:bg-[#14B8A6]/20 rounded-md text-[14px] font-semibold transition-colors">
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#1E2937] border border-[#334155] text-stone-100 rounded-md text-[14px] font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin Portal
                </a>
              )}
              <a href="/download" className="bg-[#14B8A6] text-white w-full justify-center py-2 text-[14px] font-extrabold rounded-md shadow-[0_0_15px_rgba(20, 184, 166,0.25)]">
                Deploy Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
