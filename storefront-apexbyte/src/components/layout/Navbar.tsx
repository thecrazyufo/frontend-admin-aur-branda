import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, Search, ArrowRight, Phone, Zap } from "lucide-react";

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

export default function Navbar({
  siteName = "ApexByte Soft",
  phone = "",
  navigation = [
    { label: "Products", href: "/products", enabled: true },
    { label: "Solutions", href: "/solutions", enabled: true },
    { label: "Resources", href: "/resources", enabled: true },
    { label: "Pricing", href: "/pricing", enabled: true }
  ],
  logoUrl,
  adminUrl,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveNavigation = navigation && navigation.length > 0 ? navigation : [
    { label: "Products", href: "/products", enabled: true },
    { label: "Solutions", href: "/solutions", enabled: true },
    { label: "Resources", href: "/resources", enabled: true },
    { label: "Pricing", href: "/pricing", enabled: true }
  ];
  
  const baseNavItems = effectiveNavigation.filter((item) => item.enabled !== false);
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
    const aboutIdx = navItems.findIndex(item => item.label.toLowerCase() === "about us" || item.label.toLowerCase() === "about");
    if (aboutIdx !== -1) {
      navItems.splice(aboutIdx + 1, 0, { label: "Our Clients", href: "/clients", enabled: true });
    } else {
      navItems.push({ label: "Our Clients", href: "/clients", enabled: true });
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const hasAdminJwt = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("admin_jwt="));
    setIsAdminLoggedIn(hasAdminJwt);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolvedAdminUrl =
    adminUrl ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/`
      : "/admin");

  const handleDropdownEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      {/* Slim top utility bar */}
      {phone && (
        <div className="bg-[var(--color-apex-900)] text-[var(--color-apex-300)] text-xs py-2 hidden md:block">
          <div className="container-custom flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Phone size={12} />
              {phone}
            </span>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Support Available
              </span>
              <span className="text-[var(--color-apex-400)]">•</span>
              <span>30-Day Money-Back Guarantee</span>
              <span className="text-[var(--color-apex-400)]">•</span>
              <a
                href="/download"
                className="text-[var(--color-cyan-400)] hover:text-[var(--color-cyan-300)] font-semibold transition-colors"
              >
                Free Trial ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
          scrolled
            ? "shadow-[0_1px_12px_rgb(0_55_179/0.10)] border-b border-[var(--color-border)]"
            : "border-b border-[var(--color-border)]"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  {/* ApexByte logomark */}
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
                </div>
              )}
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5 ml-8">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <a
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-[var(--radius-md)] text-[14.5px] font-semibold transition-all tracking-tight ${
                      activeDropdown === item.label
                        ? "text-[var(--color-apex-700)] bg-[var(--color-apex-50)] shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-apex-600)] hover:bg-[var(--color-surface-2)] hover:shadow-sm"
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={13}
                        strokeWidth={2.5}
                        className={`transition-transform duration-150 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-2 animate-fade-in"
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-apex-600)] hover:bg-[var(--color-apex-50)] transition-colors group/item"
                        >
                          <span>{child.label}</span>
                          <ArrowRight
                            size={13}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[var(--color-apex-500)]"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA Area */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <a
                href="/search"
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-apex-600)] hover:bg-[var(--color-apex-50)] rounded-[var(--radius-md)] transition-colors"
                aria-label="Search"
              >
                <Search size={17} />
              </a>

              <div className="h-4 w-px bg-[var(--color-border)] mx-1"></div>

              <a
                href="/find-your-tool"
                className="text-[13px] font-semibold text-[var(--color-cyan-600)] hover:text-[var(--color-cyan-700)] bg-[var(--color-cyan-50)] hover:bg-[var(--color-cyan-100)] border border-[var(--color-cyan-200)] px-3 py-1.5 rounded-md transition-colors"
              >
                Find Your Tool
              </a>

              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-apex-900)] text-white rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--color-apex-800)] shadow-sm transition-all"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Admin
                </a>
              )}

              <div className="h-4 w-px bg-[var(--color-border)] mx-1"></div>

              <a href="/contact" className="text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-apex-600)] transition-colors px-2">
                Contact
              </a>
              
              <a
                href="/download"
                className="btn btn-primary text-sm py-2 px-4 shadow-[0_0_12px_rgba(0,85,179,0.15)] hover:shadow-[0_0_20px_rgba(0,85,179,0.3)] transition-all"
              >
                Deploy
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-[var(--radius-md)] transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--color-border)] px-4 pt-3 pb-5 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-apex-600)] hover:bg-[var(--color-apex-50)] rounded-[var(--radius-md)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} />}
                </a>
                {item.children && (
                  <div className="ml-4 border-l-2 border-[var(--color-border)] pl-3 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-apex-500)] transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-2 border-t border-[var(--color-border)] mt-3">
              <a href="/find-your-tool" className="flex items-center justify-center gap-1.5 w-full py-2 bg-[var(--color-cyan-50)] text-[var(--color-cyan-600)] border border-[var(--color-cyan-200)] hover:bg-[var(--color-cyan-100)] rounded-[var(--radius-md)] text-sm font-semibold transition-colors">
                Find Your Tool
              </a>
              {isAdminLoggedIn && (
                <a
                  href={resolvedAdminUrl}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-apex-900)] text-white rounded-[var(--radius-md)] text-sm font-bold hover:bg-[var(--color-apex-800)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Admin Portal
                </a>
              )}
              <a
                href="/contact"
                className="btn btn-outline w-full justify-center text-sm"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>
              <a
                href="/download"
                className="btn btn-primary w-full justify-center text-sm shadow-[0_0_15px_rgba(0,85,179,0.2)]"
                onClick={() => setIsOpen(false)}
              >
                Deploy Now
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
