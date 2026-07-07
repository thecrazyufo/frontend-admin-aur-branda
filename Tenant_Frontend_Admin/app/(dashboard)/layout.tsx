"use client";

import { useEffect, useState, ReactNode, createContext, useContext, Suspense } from "react";
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth";
import { AdminOwnerAPI } from "@/services/api";
import ChatWidget from "@/components/ui/ChatWidget";

// ─── Extensible Roles & Navigation Registry ─────────────────────────────────
export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// SVG icon components
const DashboardIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const UsersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BrandIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);
const ProductIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const ContentIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LicenseIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const HelpIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BookIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const TagIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const ServerIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" strokeLinecap="round" strokeWidth="3" />
    <line x1="6" y1="18" x2="6.01" y2="18" strokeLinecap="round" strokeWidth="3" />
  </svg>
);
const DatabaseIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
  </svg>
);
const BriefcaseIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

// Helper to check if a role is a super admin (new or legacy)
function isSuperAdmin(role: string) {
  return role === "SUPER_ADMIN" || role === "OWNER";
}

export const ROLE_NAV_REGISTRY: Record<string, NavigationItem[]> = {
  // ─── New Simplified Roles ──────────────────────────────────
  SUPER_ADMIN: [
    { label: "User Management", path: "/owner", icon: UsersIcon },
  ],
  ADMIN: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Brand Manager", path: "/brand", icon: BrandIcon },
    { label: "Social Proof", path: "/social-proof", icon: BrandIcon },
    { label: "Deployment", path: "/deployment", icon: ServerIcon },
    { label: "License Admin", path: "/admin", icon: LicenseIcon },
  ],
  SEO: [
    { label: "Product Manager", path: "/cc?tab=products", icon: ProductIcon },
    { label: "Blog Manager", path: "/cc?tab=blogs", icon: ContentIcon },
    { label: "FAQ Manager", path: "/cc?tab=faqs", icon: HelpIcon },
    { label: "Category Manager", path: "/cc?tab=categories", icon: TagIcon },
    { label: "Guide Manager", path: "/cc?tab=help", icon: BookIcon },
    { label: "Career Manager", path: "/cc?tab=jobs", icon: BriefcaseIcon },
    { label: "Client Manager", path: "/social-proof", icon: BrandIcon },
    { label: "Content & SEO", path: "/seo", icon: ContentIcon },
    { label: "Global Registry", path: "/seo/registry", icon: DatabaseIcon },
  ],
  SEO_CW_PRODUCT_MANAGER: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Product Manager", path: "/cc?tab=products", icon: ProductIcon },
    { label: "Blog Manager", path: "/cc?tab=blogs", icon: ContentIcon },
    { label: "FAQ Manager", path: "/cc?tab=faqs", icon: HelpIcon },
    { label: "Category Manager", path: "/cc?tab=categories", icon: TagIcon },
    { label: "Guide Manager", path: "/cc?tab=help", icon: BookIcon },
    { label: "Career Manager", path: "/cc?tab=jobs", icon: BriefcaseIcon },
    { label: "Client Manager", path: "/social-proof", icon: BrandIcon },
    { label: "Content & SEO", path: "/seo", icon: ContentIcon },
    { label: "Global Registry", path: "/seo/registry", icon: DatabaseIcon },
  ],
  // ─── Legacy Roles (backwards compatibility) ────────────────
  OWNER: [
    { label: "User Management", path: "/owner", icon: UsersIcon },
  ],
  BRAND_MANAGER: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Brand Manager", path: "/brand", icon: BrandIcon },
  ],
  PRODUCT_MANAGER: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Product Manager", path: "/cc?tab=products", icon: ProductIcon },
  ],
  CONTENT_SEO_MANAGER: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Content & SEO", path: "/seo", icon: ContentIcon },
  ],
  WRITER: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "Product Manager", path: "/cc?tab=products", icon: ContentIcon },
  ],
  LICENSE_ADMIN: [
    { label: "Overview", path: "", icon: DashboardIcon },
    { label: "License Admin", path: "/admin", icon: LicenseIcon },
  ]
};

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext<{
  theme: "dark" | "light";
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Site/Tenant Context ──────────────────────────────────────────────────────
export const SiteContext = createContext<{
  siteId: string;
  setSiteId: (id: string) => void;
}>({ siteId: "brandA", setSiteId: () => {} });

export function useSite() {
  return useContext(SiteContext);
}

function SidebarOwnerSubNav({ ownerStats, pathname, activeBrands }: { ownerStats: any; pathname: string; activeBrands: any[] }) {
  const searchParams = useSearchParams();
  const filterVal = searchParams.get("filter");

  return (
    <div className="owner-sub-nav flex flex-col gap-0.5 border-l border-zinc-700 pl-3 ml-4.5 mt-1 mb-2">
      {[
        { id: "all", label: "Global Scope", count: ownerStats.global, color: "#94a3b8" },
        ...activeBrands.map(b => {
          let color = "#6366f1";
          try {
             if (b.themeColors) color = JSON.parse(b.themeColors).primary || color;
          } catch(e){}
          return { id: b.id, label: b.name, count: ownerStats[b.id] || 0, color };
        })
      ].map((sub) => {
        const subHref = `/owner?filter=${sub.id}`;
        const isSubActive = pathname === "/owner" && (
          sub.id === "all"
            ? (!filterVal || filterVal === "all")
            : filterVal === sub.id
        );

        return (
          <Link
            key={sub.id}
            href={subHref}
            className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              isSubActive 
                ? "text-white bg-zinc-700 font-semibold" 
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sub.color }}></span>
              <span className="truncate max-w-[110px]">{sub.label}</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                isSubActive 
                  ? "bg-zinc-700 border-zinc-600 text-white" 
                  : "bg-zinc-800 border-zinc-700 text-zinc-300"
              }`}
            >
              {sub.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

interface SidebarNavItemsProps {
  navItems: any[];
  pathname: string;
  siteId: string;
  isOwnerNavExpanded: boolean;
  setIsOwnerNavExpanded: (val: boolean) => void;
  ownerStats: any;
  activeBrands: any[];
  userRole: string;
  sidebarOpen: boolean;
}

function SidebarNavItems({
  navItems,
  pathname,
  siteId,
  isOwnerNavExpanded,
  setIsOwnerNavExpanded,
  ownerStats,
  activeBrands,
  userRole,
  sidebarOpen
}: SidebarNavItemsProps) {
  const searchParams = useSearchParams();
  return (
    <>
      {navItems.map((item, idx) => {
        const isOwnerPanel = item.href === "/owner";
        const itemPathOnly = item.href.split("?")[0];
        const itemQueryTab = item.href.includes("tab=") ? item.href.split("tab=")[1] : "";
        const currentTab = searchParams.get("tab") || "";
        const href = item.href;
        const hrefPathOnly = href.split("?")[0];
        const isActive = isOwnerPanel 
          ? pathname === "/owner" 
          : (pathname === hrefPathOnly && (itemQueryTab ? currentTab === itemQueryTab : !currentTab));

        if (isOwnerPanel && isSuperAdmin(userRole)) {
          return (
            <div key={idx} className="space-y-0.5">
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all relative ${isActive ? "text-white bg-zinc-700 font-semibold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"}`}
                onClick={() => setIsOwnerNavExpanded(!isOwnerNavExpanded)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0 opacity-80">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={`transition-transform duration-200 ${isOwnerNavExpanded ? "rotate-0" : "-rotate-90"} opacity-50`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </div>

              {sidebarOpen && isOwnerNavExpanded && (
                <Suspense fallback={null}>
                  <SidebarOwnerSubNav ownerStats={ownerStats} pathname={pathname} activeBrands={activeBrands} />
                </Suspense>
              )}
            </div>
          );
        }

        return (
          <Link
            key={idx}
            href={href}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all relative ${isActive ? "text-white bg-zinc-700 font-semibold shadow-sm" : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"}`}
          >
            <span className="shrink-0 opacity-80">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        );
      })}
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const brandIdFromUrl = params?.brandId as string | undefined;

  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [sessionBrandId, setSessionBrandId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [siteId, setSiteId] = useState("brandA");
  
  const [activeBrands, setActiveBrands] = useState<any[]>([]);

  useEffect(() => {
    import("@/services/api").then(({ BrandAPI }) => {
      BrandAPI.getActiveBrands().then(setActiveBrands).catch(console.error);
    });
  }, []);

  const [isOwnerNavExpanded, setIsOwnerNavExpanded] = useState(true);
  const [ownerStats, setOwnerStats] = useState<Record<string, number>>({
    global: 0
  });

  useEffect(() => {
    if (brandIdFromUrl) {
      setSiteId(brandIdFromUrl);
      localStorage.setItem("admin_site_id", brandIdFromUrl);
    } else {
      const savedSite = localStorage.getItem("admin_site_id");
      if (savedSite) setSiteId(savedSite);
    }
  }, [brandIdFromUrl]);

  function handleSiteChange(id: string) {
    setSiteId(id);
    localStorage.setItem("admin_site_id", id);
    window.location.reload();
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("admin_theme") as "dark" | "light" | null;
    if (storedTheme === "dark") {
      setTheme("light");
      localStorage.setItem("admin_theme", "light");
    } else if (storedTheme) {
      setTheme(storedTheme);
    }

    const session = AuthService.getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setUsername(session.username);
    setUserRole(session.role);
    setSessionBrandId(session.brandId);

    if (isSuperAdmin(session.role)) {
      AdminOwnerAPI.getCredentials()
        .then((users) => {
          const stats: Record<string, number> = {
            global: users.filter((u: any) => u.brandId === "all" || isSuperAdmin(u.role)).length
          };
          users.forEach((u: any) => {
            if (u.brandId !== "all" && !isSuperAdmin(u.role)) {
              stats[u.brandId] = (stats[u.brandId] || 0) + 1;
            }
          });
          setOwnerStats(stats);
        })
        .catch((err) => console.error("Failed to load layout stats", err));
    }
  }, [router]);

  // Route Guard Effect
  useEffect(() => {
    const session = AuthService.getSession();
    if (!session) return;

    const role = session.role;
    const userBrand = session.brandId;

    let allowedHrefs: string[] = [];
    if (isSuperAdmin(role)) {
      if (activeBrands.length === 0) return; // Wait for brands to load
      
      allowedHrefs = [
        "/",
        "/owner",
        `/${siteId}`,
        `/${siteId}/seo`,
        `/${siteId}/seo/registry`,
        `/${siteId}/cc`,
        `/${siteId}/brand`,
        `/${siteId}/admin`
      ];
      // Allow any active brand scope for all pages
      activeBrands.forEach(b => {
        allowedHrefs.push(`/${b.id}`);
        allowedHrefs.push(`/${b.id}/seo`);
        allowedHrefs.push(`/${b.id}/seo/registry`);
        allowedHrefs.push(`/${b.id}/cc`);
        allowedHrefs.push(`/${b.id}/brand`);
        allowedHrefs.push(`/${b.id}/admin`);
      });
    } else {
      const allowedItems = ROLE_NAV_REGISTRY[role] || [];
      allowedHrefs = allowedItems.map(item => `/${userBrand}${item.path}`);
    }

    if (allowedHrefs.length > 0) {
      const isAllowed = allowedHrefs.some(href => {
        const cleanHref = href.split("?")[0];
        return pathname === cleanHref || pathname.startsWith(cleanHref + "/");
      });
      if (!isAllowed) {
        router.replace(allowedHrefs[0]);
      }
    }
  }, [pathname, siteId, router]);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("admin_theme", newTheme);
  }

  function handleLogout() {
    AuthService.logout();
    document.cookie = "admin_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.replace("/admin/login");
  }

  function handleBrandTabClick(targetBrandId: string) {
    localStorage.setItem("admin_site_id", targetBrandId);
    setSiteId(targetBrandId);

    const pathParts = pathname.split("/");
    if (pathParts.length > 1 && activeBrands.some(b => b.id === pathParts[1])) {
      pathParts[1] = targetBrandId;
      router.push(pathParts.join("/"));
    } else {
      window.location.reload();
    }
  }

  const isDark = theme === "dark";
  const activeBrandConfig = activeBrands.find(b => b.id === siteId);
  const siteUrl = activeBrandConfig?.devPort 
    ? `http://localhost:${activeBrandConfig.devPort}` 
    : `https://${activeBrandConfig?.domain || "prismmigration.local"}`;

  // Phase 4: Dynamic Admin Theming
  let primaryColor = "#1a56db";
  let primaryDark = "#1342b5";
  let primaryLight = "#3b82f6";
  let accentColor = "#f59e0b";
  
  try {
    if (activeBrandConfig?.themeColors) {
      const parsedTheme = typeof activeBrandConfig.themeColors === "string" 
        ? JSON.parse(activeBrandConfig.themeColors) 
        : activeBrandConfig.themeColors;
      if (parsedTheme.primaryColor) primaryColor = parsedTheme.primaryColor;
      if (parsedTheme.primaryDark) primaryDark = parsedTheme.primaryDark;
      if (parsedTheme.primaryLight) primaryLight = parsedTheme.primaryLight;
      if (parsedTheme.accentColor) accentColor = parsedTheme.accentColor;
    }
  } catch(e) {}

  // Resolve navigation links from registry dynamically
  let navItems = [];
  if (isSuperAdmin(userRole)) {
    navItems = [
      {
        label: "User Management",
        href: "/owner",
        icon: UsersIcon
      },
      {
        label: "Overview",
        href: `/${siteId}`,
        icon: DashboardIcon
      },
      {
        label: "Brand Manager",
        href: `/${siteId}/brand`,
        icon: BrandIcon
      },
      {
        label: "Product Manager",
        href: `/${siteId}/cc`,
        icon: ProductIcon
      },
      {
        label: "Content & SEO",
        href: `/${siteId}/seo`,
        icon: ContentIcon
      },
      {
        label: "License Admin",
        href: `/${siteId}/admin`,
        icon: LicenseIcon
      }
    ];
  } else {
    const allowedItems = ROLE_NAV_REGISTRY[userRole] || [];
    navItems = allowedItems.map(item => ({
      label: item.label,
      href: `/${siteId}${item.path}`,
      icon: item.icon
    }));
  }

  return (
    <SiteContext.Provider value={{ siteId, setSiteId: handleSiteChange }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --dynamic-primary: ${primaryColor};
            --dynamic-primary-dark: ${primaryDark};
            --dynamic-primary-light: ${primaryLight};
            --dynamic-accent: ${accentColor};
          }
        `}} />
        <div className={`admin-shell ${isDark ? "dark" : "light"} flex min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200`}>
          {/* ── Sidebar ── */}
          <aside className={`sticky top-0 h-screen flex flex-col border-r border-zinc-800 bg-[#1F2937] transition-all duration-200 ease-out overflow-hidden z-20 ${sidebarOpen ? "w-60" : "w-14"}`}>
            <div className="flex items-center justify-between px-3.5 h-14 border-b border-zinc-800 shrink-0">
              <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity decoration-none text-inherit">
                {activeBrandConfig?.logoUrl ? (
                  <img src={activeBrandConfig.logoUrl} alt={activeBrandConfig.name} className="w-6 h-6 object-contain" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
                    <rect width="32" height="32" rx="6" fill="url(#sgrad)" />
                    <path d="M8 16L13 21L24 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="sgrad" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0%" stopColor="var(--dynamic-primary, #6366f1)" />
                        <stop offset="100%" stopColor="var(--dynamic-accent, #8b5cf6)" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                {sidebarOpen && <span className="font-bold text-xs tracking-tight text-white truncate max-w-[120px]">{activeBrandConfig?.name || "Admin Portal"}</span>}
              </Link>
              <button
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-200">
                  {sidebarOpen ? (
                    <polyline points="15 18 9 12 15 6" />
                  ) : (
                    <polyline points="9 18 15 12 9 6" />
                  )}
                </svg>
              </button>
            </div>

            {sidebarOpen && (
              <div className="p-3 border-b border-zinc-800 shrink-0">
                {pathname.includes("/seo") || pathname.includes("/cc") || pathname.includes("/admin") || pathname.includes("/brand") || pathname === `/${siteId}` ? (
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
                      Active Storefront {isSuperAdmin(userRole) ? "🔓" : "🔒"}
                    </label>
                    {isSuperAdmin(userRole) ? (
                      <select
                        className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow appearance-none cursor-pointer"
                        value={siteId}
                        onChange={(e) => handleBrandTabClick(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "12px", paddingRight: "24px" }}
                      >
                        {activeBrands.length > 0 ? (
                          activeBrands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))
                        ) : (
                          <option value="brandA">Brand A</option>
                        )}
                      </select>
                    ) : (
                      <div className="w-full bg-zinc-850 border border-zinc-700 text-zinc-100 text-xs rounded-md px-2 py-1.5 font-medium flex items-center gap-2 cursor-not-allowed">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        {activeBrandConfig?.name || siteId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
                      Platform Scope
                    </label>
                    <div className="w-full bg-indigo-950/40 border border-indigo-900/50 rounded-md py-1 text-center text-[11px] font-semibold text-indigo-300">
                      Global Context 🌍
                    </div>
                  </div>
                )}
              </div>
            )}

            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-none">
              <Suspense fallback={<div className="h-10 animate-pulse bg-zinc-800/40 rounded-md m-2" />}>
                <SidebarNavItems
                  navItems={navItems}
                  pathname={pathname}
                  siteId={siteId}
                  isOwnerNavExpanded={isOwnerNavExpanded}
                  setIsOwnerNavExpanded={setIsOwnerNavExpanded}
                  ownerStats={ownerStats}
                  activeBrands={activeBrands}
                  userRole={userRole}
                  sidebarOpen={sidebarOpen}
                />
              </Suspense>
            </nav>

            <div className="p-2 border-t border-zinc-800 flex flex-col gap-1.5 shrink-0 bg-[#1F2937]">
              <div className="flex items-center gap-2 p-1">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm shadow-indigo-500/20">
                  {username?.charAt(0).toUpperCase() || "A"}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-white truncate">{username}</span>
                    <span className="text-[9px] text-zinc-300 truncate">
                      {isSuperAdmin(userRole) ? "Super Admin" : userRole.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
              <button
                className="flex items-center justify-center gap-1.5 w-full px-2 py-1 text-[11px] font-semibold rounded-md border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-900/30 hover:bg-red-950/20 transition-all cursor-pointer"
                onClick={handleLogout}
                id="admin-logout-btn"
                title="Logout"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </aside>

          {/* ── Main Content Area ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
            {/* Topbar / Header */}
            <header className="flex items-center justify-between px-6 h-14 border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-xs">
              <div className="flex items-center gap-5 min-w-0">
                <h1 className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">
                  {navItems.find(item => pathname === item.href || (item.href !== `/${siteId}` && pathname.startsWith(item.href + "/")))?.label || "Dashboard"}
                </h1>

                {/* Minimal inline search */}
                <div className="relative hidden md:block w-48 lg:w-56">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-450"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Brand Switch Tabs (compact inline layout) */}
                {(pathname.includes("/seo") || pathname.includes("/cc") || pathname.includes("/admin") || pathname.includes("/brand") || pathname === `/${siteId}`) && (
                  <div className="flex items-center gap-0.5 bg-zinc-100 p-0.5 rounded-md border border-zinc-200 shrink-0">
                    {[
                      { id: "brandA", label: "A" },
                      { id: "brandB", label: "B" },
                      { id: "brandC", label: "C" },
                      { id: "brandD", label: "D" },
                      { id: "brandE", label: "E" },
                    ].map((b) => {
                      const isActive = siteId === b.id;
                      const isAllowed = isSuperAdmin(userRole) || sessionBrandId === b.id;

                      return (
                        <button
                          key={b.id}
                          disabled={!isAllowed}
                          onClick={() => handleBrandTabClick(b.id)}
                          className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded transition-all ${isActive ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500 hover:text-zinc-900"} ${isAllowed ? "cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
                          title={!isAllowed ? "Access restricted" : `Switch to Brand ${b.label}`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Notification bell */}
                <button className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-550 hover:text-zinc-800 transition-all cursor-pointer relative" title="Notifications">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute top-1 right-1 w-1 h-1 bg-indigo-500 rounded-full" />
                </button>

                {/* Theme toggle */}
                <button
                  className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-555 hover:text-zinc-800 transition-all cursor-pointer"
                  onClick={toggleTheme}
                  title="Switch color mode"
                  id="admin-theme-toggle"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                </button>

                {/* View site link */}
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-555 hover:text-zinc-800 transition-all decoration-none shadow-xs"
                  title="View live storefront"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  <span>Store</span>
                </a>
              </div>
            </header>

            {/* Page content */}
            <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
        <ChatWidget />
      </ThemeContext.Provider>
    </SiteContext.Provider>
  );
}
