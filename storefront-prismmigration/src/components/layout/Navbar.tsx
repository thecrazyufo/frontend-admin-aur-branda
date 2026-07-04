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
            ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-stone-900 shadow-lg"
            : "bg-black/30 backdrop-blur-md border-stone-900/40"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-7 h-7 rounded-md object-contain" />
              ) : (
                <svg className="w-5 h-5 text-[#EAB308] filter drop-shadow-[0_0_6px_rgba(234,179,8,0.8)] transition-transform group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                  <polygon points="50,15 15,80 85,80" />
                  <line x1="50" y1="15" x2="50" y2="80" strokeWidth="4" />
                </svg>
              )}
              <div>
                <span className="font-bold text-white tracking-tight text-lg group-hover:text-[#EAB308] transition-colors">
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      activeDropdown === item.label
                        ? "text-[#EAB308] bg-stone-900/50"
                        : "text-white hover:text-[#EAB308] hover:bg-stone-900/50"
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
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform text-stone-400 ${activeDropdown === item.label ? "rotate-180 text-[#EAB308]" : ""}`}
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-stone-950 rounded-lg shadow-lg border border-stone-900 py-1.5 animate-fade-in z-50">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-[14px] text-stone-300 hover:text-[#EAB308] hover:bg-stone-900/40 transition-colors focus-visible:outline-none focus-visible:bg-stone-900/40 focus-visible:text-[#EAB308]"
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
                className="p-1.5 text-stone-300 hover:text-[#EAB308] hover:bg-stone-900/50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]"
                aria-label="Search"
              >
                <Search size={16} />
              </a>
              <div className="h-4 w-px bg-stone-900 mx-1"></div>
              <a
                href="/find-your-tool"
                className="text-[13px] font-semibold text-[#EAB308] hover:text-[#f1c40f] bg-[#EAB308]/10 hover:bg-[#EAB308]/20 border border-[#EAB308]/20 px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]"
              >
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 border border-stone-800 text-stone-100 rounded-md text-[13px] font-semibold hover:bg-stone-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin
                </a>
              )}
              <div className="h-4 w-px bg-stone-900 mx-1"></div>
              <a href="/products" className="text-[14px] font-medium text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]">
                Contact
              </a>
              <a href="/download" className="bg-[#EAB308] hover:bg-[#f1c40f] text-black font-extrabold text-[13px] py-1.5 px-3.5 rounded-md transition-all duration-300 shadow-[0_0_12px_rgba(234,179,8,0.25)] hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]">
                Deploy
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 text-stone-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-stone-950/95 backdrop-blur-md border-t border-stone-900 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2 text-[15px] font-medium text-white hover:text-[#EAB308] hover:bg-stone-900/50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
                {item.children && (
                  <div className="ml-4 border-l border-stone-900 pl-3 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-[14px] text-stone-300 hover:text-[#EAB308]"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-stone-900 mt-4">
              <a href="/find-your-tool" className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/25 hover:bg-[#EAB308]/20 rounded-md text-[14px] font-semibold transition-colors">
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-md text-[14px] font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin Portal
                </a>
              )}
              <a href="/download" className="bg-[#EAB308] text-black w-full justify-center py-2 text-[14px] font-extrabold rounded-md shadow-[0_0_15px_rgba(234,179,8,0.25)]">
                Deploy Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
