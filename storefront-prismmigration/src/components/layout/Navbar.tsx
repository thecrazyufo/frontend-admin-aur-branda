import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import type { Product } from "../../types/product";
import { CATEGORY_LABELS } from "../../types/product";

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
  products?: Product[];
}

export default function Navbar({ siteName = "", phone = "", navigation = [], logoUrl, adminUrl, products = [] }: NavbarProps) {
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

  const hasBlog = navItems.some(item => item.label.toLowerCase() === "blog");
  if (!hasBlog) {
    const productsIdx = navItems.findIndex(item => item.label.toLowerCase() === "products");
    if (productsIdx !== -1) {
      navItems.splice(productsIdx + 1, 0, { label: "Blog", href: "/blog", enabled: true });
    } else {
      navItems.push({ label: "Blog", href: "/blog", enabled: true });
    }
  }

  // Symmetrical Hardcoded Safety Fallbacks for FAQ and Security
  const hasFaq = navItems.some(item => item.label.toLowerCase() === "faq" || item.label.toLowerCase() === "faqs");
  if (!hasFaq) {
    const helpIdx = navItems.findIndex(item => item.label.toLowerCase() === "help");
    if (helpIdx !== -1) {
      navItems.splice(helpIdx + 1, 0, { label: "FAQ", href: "/faq", enabled: true });
    } else {
      navItems.push({ label: "FAQ", href: "/faq", enabled: true });
    }
  }

  const hasSecurity = navItems.some(item => item.label.toLowerCase() === "security");
  if (!hasSecurity) {
    const clientsIdx = navItems.findIndex(item => item.label.toLowerCase().includes("clients"));
    if (clientsIdx !== -1) {
      navItems.splice(clientsIdx + 1, 0, { label: "Security", href: "/security", enabled: true });
    } else {
      navItems.push({ label: "Security", href: "/security", enabled: true });
    }
  }

  const finalNavItems = navItems.map(item => {
    if (item.label.toLowerCase() === "help") {
      return {
        ...item,
        children: [
          { label: "User Guides", href: "/help" },
          { label: "FAQs", href: "/faq" },
          { label: "Download Center", href: "/download" },
          { label: "Contact Support", href: "/contact" }
        ]
      };
    }
    return item;
  });

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
            ? "bg-[#0B0F1A]/95 backdrop-blur-xl border-[#334155] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            : "bg-[#0A0F1A]/60 backdrop-blur-md border-[#1E2937]/60"
        }`}
      >
        {/* Teal top accent line on scroll */}
        <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        <div className="container-custom">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-7 h-7 rounded-md object-contain" />
              ) : (
                <svg className="w-5 h-5 text-[#6366F1] filter drop-shadow-[0_0_6px_rgba(99, 102, 241,0.8)] transition-transform group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                  <polygon points="50,15 15,80 85,80" />
                  <line x1="50" y1="15" x2="50" y2="80" strokeWidth="4" />
                </svg>
              )}
              <div>
                <span className="font-bold text-white tracking-tight text-lg group-hover:text-[#6366F1] transition-colors">
                  {siteName || "Prism Migration"}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2">
              {finalNavItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className={`relative flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      activeDropdown === item.label || currentPath === item.href
                        ? "text-[#6366F1] bg-[#6366F1]/8"
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
                        className={`transition-transform text-[#64748B] ${activeDropdown === item.label ? "rotate-180 text-[#6366F1]" : ""}`}
                      />
                    )}
                    {/* Active page dot indicator */}
                    {currentPath === item.href && !item.children && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6366F1]" />
                    )}
                  </a>

                  {/* Mega Dropdown for Products or standard dropdown for others */}
                  {item.children && activeDropdown === item.label && (
                    item.label.toLowerCase() === "products" ? (
                      <div 
                        className="absolute top-full left-1/2 -translate-x-1/3 mt-2 w-[900px] bg-[#0B0F1A]/95 backdrop-blur-xl rounded-xl border border-[#334155] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-12 gap-6 animate-fade-in z-50 text-left"
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {/* Categories Columns */}
                        <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-6">
                          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
                            const catProducts = products.filter(p => p.category === catKey && p.enabled !== false);
                            if (catProducts.length === 0) return null;
                            return (
                              <div key={catKey} className="space-y-2">
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#6366F1] flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-[#6366F1]"></span>
                                  {catLabel}
                                </h4>
                                <div className="space-y-1">
                                  {catProducts.slice(0, 4).map(prod => (
                                    <a
                                      key={prod.id}
                                      href={`/products/${prod.slug}`}
                                      className="group/item block p-1.5 -ml-1.5 rounded-lg hover:bg-[#1E2937]/45 transition-colors focus-visible:outline-none focus-visible:bg-[#1E2937]/45"
                                    >
                                      <p className="text-xs font-bold text-white group-hover/item:text-[#6366F1] transition-colors">{prod.name}</p>
                                      <p className="text-[10px] text-[#94A3B8] group-hover/item:text-stone-300 transition-colors line-clamp-1 mt-0.5">{prod.shortDescription}</p>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Spotlight Column */}
                        <div className="col-span-4 bg-[#1E2937]/35 border border-[#334155] rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-[9px] font-extrabold uppercase tracking-wider rounded mb-3">
                              ✨ Spotlight
                            </span>
                            {products.length > 0 ? (
                              (() => {
                                const spotlightProduct = products.find(p => p.badge === "bestseller") || products[0];
                                return (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-extrabold text-white">{spotlightProduct.name}</h4>
                                    <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-3">{spotlightProduct.shortDescription}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                      <span>★</span>
                                      <span className="text-white">{spotlightProduct.rating || 5} / 5</span>
                                    </div>
                                    <div className="pt-2">
                                      <a
                                        href={`/products/${spotlightProduct.slug}`}
                                        className="inline-flex items-center gap-1.5 text-xs text-[#6366F1] font-bold hover:underline"
                                      >
                                        Learn More
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="space-y-2">
                                <h4 className="text-sm font-extrabold text-white">Migration Suite</h4>
                                <p className="text-[11px] text-[#94A3B8] leading-relaxed">Discover our comprehensive collection of mail migration utilities.</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 border-t border-[#334155]/50 pt-3">
                            <a href="/find-your-tool" className="block text-center py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-black font-extrabold text-[11px] rounded transition-all duration-200">
                              Compare All Tools
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : item.label.toLowerCase() === "help" ? (
                      <div 
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-[#0B0F1A]/95 backdrop-blur-xl rounded-xl border border-[#334155] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-3.5 animate-fade-in z-50 text-left"
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <a href="/help" className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#1E2937]/45 group/sub focus-visible:outline-none focus-visible:bg-[#1E2937]/45">
                          <span className="text-lg mt-0.5">📖</span>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover/sub:text-[#6366F1] transition-colors">User Guides</h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Step-by-step conversion & setup tutorials</p>
                          </div>
                        </a>
                        <a href="/faq" className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#1E2937]/45 group/sub focus-visible:outline-none focus-visible:bg-[#1E2937]/45">
                          <span className="text-lg mt-0.5">❓</span>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover/sub:text-[#6366F1] transition-colors">Frequently Asked Questions</h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Answers to licenses, billing, and errors</p>
                          </div>
                        </a>
                        <a href="/download" className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#1E2937]/45 group/sub focus-visible:outline-none focus-visible:bg-[#1E2937]/45">
                          <span className="text-lg mt-0.5">📥</span>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover/sub:text-[#6366F1] transition-colors">Download Center</h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Latest trial setups and installer versions</p>
                          </div>
                        </a>
                        <a href="/contact" className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#1E2937]/45 group/sub focus-visible:outline-none focus-visible:bg-[#1E2937]/45">
                          <span className="text-lg mt-0.5">✉️</span>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover/sub:text-[#6366F1] transition-colors">Contact Support</h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Get in touch with our support team</p>
                          </div>
                        </a>
                      </div>
                    ) : (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-[#0B0F1A] rounded-lg shadow-lg border border-[#334155] py-1.5 animate-fade-in z-50 text-left">
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-[14px] text-[#E2E8F0] hover:text-[#6366F1] hover:bg-[#1E2937]/40 transition-colors focus-visible:outline-none focus-visible:bg-[#1E2937]/40 focus-visible:text-[#6366F1]"
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
                    )
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="/search"
                className="p-1.5 text-[#E2E8F0] hover:text-[#6366F1] hover:bg-[#1E2937]/50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
                aria-label="Search"
              >
                <Search size={16} />
              </a>
              <div className="h-4 w-px bg-[#334155] mx-1"></div>
              <a
                href="/find-your-tool"
                className="text-[13px] font-semibold text-white hover:text-white bg-transparent hover:bg-[#6C5CE7]/15 border border-[#6C5CE7]/60 hover:border-[#6C5CE7] px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              >
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2937] border border-[#334155] text-stone-100 rounded-md text-[13px] font-semibold hover:bg-stone-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Admin
                </a>
              )}
              <div className="h-4 w-px bg-[#334155] mx-1"></div>
              <a href="/products" className="text-[14px] font-medium text-[#E2E8F0] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]">
                Contact
              </a>
              <a href="/download" style={{color: '#ffffff'}} className="bg-[#6C5CE7] hover:bg-[#5B4FE0] !text-white text-white font-semibold text-[13px] py-1.5 px-3.5 rounded-md transition-all duration-300 shadow-[0_0_12px_rgba(108,92,231,0.3)] hover:shadow-[0_0_20px_rgba(108,92,231,0.55)] transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]">
                Deploy
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 text-[#E2E8F0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#0B0F1A]/95 backdrop-blur-md border-t border-[#334155] px-4 py-4 space-y-1">
            {finalNavItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-2 text-[15px] font-medium text-white hover:text-[#6366F1] hover:bg-[#1E2937]/50 rounded-md"
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
                        className="block py-2 text-[14px] text-[#E2E8F0] hover:text-[#6366F1]"
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
              <a href="/find-your-tool" className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25 hover:bg-[#6366F1]/20 rounded-md text-[14px] font-semibold transition-colors">
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
              <a href="/download" style={{color: '#ffffff'}} className="bg-[#6C5CE7] hover:bg-[#5B4FE0] !text-white text-white w-full flex items-center justify-center py-2 text-[14px] font-semibold rounded-md shadow-[0_0_15px_rgba(108,92,231,0.3)]">
                Deploy Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
