import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Search, Sparkles } from "lucide-react";
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
  const [currentPath, setCurrentPath] = useState("");

  // Labels that clutter the navbar — removed per design standards
  const HIDDEN_NAV_LABELS = new Set([
    "our clients", "clients", "security", "about", "about us",
    "careers", "faq", "faqs",
  ]);

  const baseNavItems = navigation
    .filter(item => item.enabled !== false)
    .filter(item => !HIDDEN_NAV_LABELS.has(item.label.toLowerCase()));

  // Normalise hrefs for known pages
  const navItems = baseNavItems.map(item => {
    if (item.label.toLowerCase() === "blog") return { ...item, href: "/blog" };
    return item;
  });

  // Ensure Blog is present — insert after Products
  const hasBlog = navItems.some(item => item.label.toLowerCase() === "blog");
  if (!hasBlog) {
    const productsIdx = navItems.findIndex(item => item.label.toLowerCase() === "products");
    if (productsIdx !== -1) {
      navItems.splice(productsIdx + 1, 0, { label: "Blog", href: "/blog", enabled: true });
    } else {
      navItems.push({ label: "Blog", href: "/blog", enabled: true });
    }
  }

  // Ensure a Help item exists (all support sub-links live inside it)
  const hasHelp = navItems.some(item => item.label.toLowerCase() === "help");
  if (!hasHelp) {
    navItems.push({ label: "Help", href: "/help", enabled: true });
  }

  // Build final items: Products and Help get dropdown configurations
  const finalNavItems = navItems.map(item => {
    if (item.label.toLowerCase() === "products") {
      return {
        ...item,
        children: [
          { label: "All Products", href: "/products" }
        ]
      };
    }
    if (item.label.toLowerCase() === "help") {
      return {
        ...item,
        children: [
          { label: "User Guides", href: "/help" },
          { label: "FAQs", href: "/faq" },
          { label: "Download Center", href: "/download" },
          { label: "Security & Compliance", href: "/security" },
          { label: "Contact Support", href: "/contact" },
        ]
      };
    }
    return item;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    setCurrentPath(window.location.pathname);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <a href="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-12 h-12 rounded-xl object-contain" />
              ) : (
                <img src="/logo-p.png" alt={siteName} className="w-12 h-12 rounded-xl object-contain transition-transform group-hover:scale-110" />
              )}
              <div>
                <span className="font-extrabold text-white tracking-tight text-2xl group-hover:text-[#6366F1] transition-colors">
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
                        className="absolute top-full left-1/2 -translate-x-1/3 mt-2 w-[900px] bg-[#0B0F1A]/95 backdrop-blur-xl rounded-xl border border-[#334155] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-12 gap-6 animate-fade-in z-50 text-left before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
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
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5" style={{color: 'var(--signal-teal)', fontFamily: 'var(--font-mono)'}}>
                                  <span className="w-1 h-1 rounded-full" style={{background: 'var(--signal-teal)'}}></span>
                                  {catLabel}
                                </h4>
                                <div className="space-y-1">
                                  {catProducts.slice(0, 4).map(prod => (
                                    <a
                                      key={prod.id}
                                      href={`/products/${prod.slug}`}
                                      className="group/item block p-1.5 -ml-1.5 rounded-lg hover:bg-[#1E2937]/45 transition-colors focus-visible:outline-none focus-visible:bg-[#1E2937]/45"
                                    >
                                      <p className="text-xs font-bold text-white group-hover/item:text-[var(--signal-teal)] transition-colors" style={{fontFamily: 'var(--font-body)'}}>{prod.name}</p>
                                      <p className="text-[10px] group-hover/item:text-stone-300 transition-colors line-clamp-1 mt-0.5" style={{color: 'var(--type-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem'}}>{prod.shortDescription}</p>
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
                                        className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{color: 'var(--signal-teal)'}}
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-[#0B0F1A]/95 backdrop-blur-xl rounded-xl border border-[#334155] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-3.5 animate-fade-in z-50 text-left before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
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
                        <a href="/security" className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#1E2937]/45 group/sub focus-visible:outline-none focus-visible:bg-[#1E2937]/45">
                          <span className="text-lg mt-0.5">🔒</span>
                          <div>
                            <h5 className="text-xs font-bold text-white group-hover/sub:text-[#6366F1] transition-colors">Security &amp; Compliance</h5>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">Data privacy, encryption, and certifications</p>
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
                      <div className="absolute top-full left-0 mt-1 w-56 bg-[#0B0F1A] rounded-lg shadow-lg border border-[#334155] py-1.5 animate-fade-in z-50 text-left before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']">
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
            <div className="hidden lg:flex items-center gap-4">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes magical-glow {
                  0%, 100% { box-shadow: 0 0 15px rgba(99,102,241,0.45), 0 0 2px rgba(99,102,241,0.2); }
                  50% { box-shadow: 0 0 25px rgba(99,102,241,0.75), 0 0 10px rgba(45,212,191,0.4); }
                }
                @keyframes shimmer-sweep {
                  0% { transform: translateX(-150%) skewX(-25deg); }
                  100% { transform: translateX(150%) skewX(-25deg); }
                }
              `}} />
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
                className="group relative inline-flex items-center gap-2 px-5 py-2 text-[12px] font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#2DD4BF] rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
                style={{
                  animation: 'magical-glow 3s infinite',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {/* Shimmer overlay */}
                <span 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  style={{
                    animation: 'shimmer-sweep 2.5s infinite linear'
                  }}
                />
                <Sparkles size={13} className="text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                <span>Find Your Tool</span>
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
              <a
                href="/find-your-tool"
                className="group relative flex items-center justify-center gap-2 w-full py-2.5 text-[13px] font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#2DD4BF] rounded-lg transition-all duration-300 active:scale-[0.98] overflow-hidden"
                style={{
                  animation: 'magical-glow 3s infinite',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
                onClick={() => setIsOpen(false)}
              >
                {/* Shimmer overlay */}
                <span 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  style={{
                    animation: 'shimmer-sweep 2.5s infinite linear'
                  }}
                />
                <Sparkles size={13} className="text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                <span>Find Your Tool</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
