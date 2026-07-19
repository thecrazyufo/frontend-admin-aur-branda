"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTheme } from "@/app/(dashboard)/layout";
import { 
  AdminProductAPI, 
  AdminBlogAPI, 
  AdminSettingsAPI,
  AdminRedirectAPI,
  UrlRedirectItem
} from "@/services/api";
import { Product } from "@/types/product";
import { AuthService } from "@/services/auth";
import { BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { cn } from "@/lib/utils";

interface SeoField {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[] | string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface SeoItem {
  id: string;
  name: string;
  slug: string;
  type: "product" | "blog";
  seo?: SeoField;
}

interface Socials {
  twitter: string;
  linkedin: string;
  youtube: string;
  facebook: string;
  github: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface SeoDefaults {
  titleTemplate?: string;
  defaultOgImage?: string;
  robotsTxt?: string;
  googleVerification?: string;
  bingVerification?: string;
  gaMeasurementId?: string;
  gtmContainerId?: string;
  clarityProjectId?: string;
}

interface SiteSettings {
  id?: string;
  siteId: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  address: string;
  socials: Socials;
  stats: StatItem[];
  seoDefaults?: SeoDefaults;
}

export default function SeoAndSettingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const brandId = (params?.brandId as string) || "";
  const tabParam = searchParams.get("tab");
  const { theme } = useTheme();

  // Primary Tab State: seo | analytics | redirects | settings
  const [activeTab, setActiveTab] = useState<"seo" | "analytics" | "redirects" | "settings">("seo");

  // User Role State
  const [userRole, setUserRole] = useState<string>("");

  // SEO Optimizer States
  const [items, setItems] = useState<SeoItem[]>([]);
  const [seoLoading, setSeoLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "product" | "blog">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<SeoItem | null>(null);
  const [seoForm, setSeoForm] = useState<SeoField>({});
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoToast, setSeoToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Brand Settings States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Redirect Manager States
  const [redirects, setRedirects] = useState<UrlRedirectItem[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(false);
  const [newSourcePath, setNewSourcePath] = useState("");
  const [newTargetPath, setNewTargetPath] = useState("");
  const [newRedirectType, setNewRedirectType] = useState<number>(301);

  // Sync tab state with search parameters
  useEffect(() => {
    if (tabParam === "settings" || tabParam === "analytics" || tabParam === "redirects") {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab("seo");
    }
  }, [tabParam]);

  function handleTabChange(tab: "seo" | "analytics" | "redirects" | "settings") {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState(null, "", url.pathname + url.search);
  }

  // Load user role context
  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      setUserRole(session.role);
    }
  }, []);

  // Dispatch data loader based on active tab
  useEffect(() => {
    if (activeTab === "seo") {
      loadSeo();
    } else if (activeTab === "settings" || activeTab === "analytics") {
      loadSettings();
    } else if (activeTab === "redirects") {
      loadRedirects();
    }
  }, [activeTab, brandId]);

  // Toast Helpers
  const triggerSeoToast = (msg: string, type: "success" | "error" = "success") => {
    setSeoToast({ msg, type });
    setTimeout(() => setSeoToast(null), 4000);
  };

  // ─── SEO Loader & Actions ──────────────────────────────────────────────────
  async function loadSeo() {
    try {
      setSeoLoading(true);
      const [products, blogs] = await Promise.all([
        AdminProductAPI.getAll(),
        AdminBlogAPI.getAll(),
      ]);
      
      const productItems: SeoItem[] = products
        .filter((p: Product) => p.siteId === brandId)
        .map((p: Product) => ({
          id: p.id!,
          name: p.name,
          slug: p.slug!,
          type: "product",
          seo: p.seo ? {
            metaTitle: p.seo.title,
            metaDescription: p.seo.description,
            keywords: p.seo.keywords,
          } : undefined,
        }));

      const blogItems: SeoItem[] = blogs
        .filter((b: BlogPost) => b.siteId === brandId)
        .map((b: BlogPost) => ({
          id: b.id!,
          name: b.title,
          slug: b.slug!,
          type: "blog",
          seo: b.seo ? {
            metaTitle: b.seo.title,
            metaDescription: b.seo.description,
            keywords: b.seo.keywords,
          } : undefined,
        }));

      setItems([...productItems, ...blogItems]);
    } catch {
      triggerSeoToast("Failed to load content for SEO audit", "error");
    } finally {
      setSeoLoading(false);
    }
  }

  function openSeoEditor(item: SeoItem) {
    setEditing(item);
    setSeoForm({
      metaTitle: item.seo?.metaTitle || "",
      metaDescription: item.seo?.metaDescription || "",
      keywords: item.seo?.keywords || [],
      canonicalUrl: item.seo?.canonicalUrl || "",
      ogTitle: item.seo?.ogTitle || "",
      ogDescription: item.seo?.ogDescription || "",
      ogImage: item.seo?.ogImage || "",
    });
  }

  async function saveSeo(isDraftOnly: boolean = false) {
    if (!editing) return;
    try {
      setSeoSaving(true);
      const keywords = typeof seoForm.keywords === "string"
        ? (seoForm.keywords as string).split(",").map((k) => k.trim()).filter(Boolean)
        : (seoForm.keywords || []);

      const apiSeo = {
        title: seoForm.metaTitle || "",
        description: seoForm.metaDescription || "",
        keywords: keywords
      };

      const localSeo = { ...seoForm, keywords: keywords };

      if (editing.type === "product") {
        const product = await AdminProductAPI.getAll().then((ps) => ps.find((p) => p.id === editing.id));
        if (product) {
          await AdminProductAPI.update(editing.id, { ...product, seo: apiSeo });
        }
      } else {
        const blog = await AdminBlogAPI.getAll().then((bs) => bs.find((b) => b.id === editing.id));
        if (blog) {
          await AdminBlogAPI.update(editing.id, { ...blog, seo: apiSeo });
        }
      }

      setItems((prev) =>
        prev.map((item) => (item.id === editing.id && item.type === editing.type ? { ...item, seo: localSeo } : item))
      );
      triggerSeoToast(isDraftOnly ? "Draft progress saved successfully!" : "SEO settings saved successfully!", "success");
      if (!isDraftOnly) {
        setEditing(null);
      }
    } catch {
      triggerSeoToast("Failed to save SEO settings", "error");
    } finally {
      setSeoSaving(false);
    }
  }

  // ─── Settings Loader & Actions ──────────────────────────────────────────────
  async function loadSettings() {
    try {
      setSettingsLoading(true);
      const data = await AdminSettingsAPI.get();
      
      const formattedData: SiteSettings = {
        id: data.id || "",
        siteId: data.siteId || brandId,
        name: data.name || "",
        tagline: data.tagline || "",
        description: data.description || "",
        url: data.url || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        socials: {
          twitter: data.socials?.twitter || "",
          linkedin: data.socials?.linkedin || "",
          youtube: data.socials?.youtube || "",
          facebook: data.socials?.facebook || "",
          github: data.socials?.github || "",
        },
        stats: data.stats || [
          { value: "1M+", label: "Downloads" },
          { value: "50K+", label: "Happy Users" },
          { value: "4.9★", label: "Avg Rating" },
          { value: "99.9%", label: "Success Rate" }
        ],
        seoDefaults: {
          titleTemplate: data.seoDefaults?.titleTemplate || "{page} — {siteName}",
          defaultOgImage: data.seoDefaults?.defaultOgImage || "",
          robotsTxt: data.seoDefaults?.robotsTxt || "User-agent: *\nAllow: /\n\nSitemap: https://prismmigration.com/sitemap.xml",
          googleVerification: data.seoDefaults?.googleVerification || "",
          bingVerification: data.seoDefaults?.bingVerification || "",
          gaMeasurementId: data.seoDefaults?.gaMeasurementId || "",
          gtmContainerId: data.seoDefaults?.gtmContainerId || "",
          clarityProjectId: data.seoDefaults?.clarityProjectId || "",
        }
      };
      setSettings(formattedData);
    } catch {
      setSettingsError("Failed to load site configurations from the database.");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;

    try {
      setSettingsSaving(true);
      setSettingsSuccess(null);
      setSettingsError(null);
      
      const payload = { ...settings, siteId: brandId };
      const updated = await AdminSettingsAPI.update(payload);
      setSettings(updated);
      setSettingsSuccess("Storefront & SEO configurations saved successfully!");
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch {
      setSettingsError("Failed to save settings. Please try again.");
    } finally {
      setSettingsSaving(false);
    }
  }

  function handleFieldChange(field: keyof SiteSettings, value: any) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  function handleSeoDefaultChange(field: keyof SeoDefaults, value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      seoDefaults: {
        ...(settings.seoDefaults || {}),
        [field]: value
      }
    });
  }

  function handleSocialChange(field: keyof Socials, value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: { ...settings.socials, [field]: value }
    });
  }

  function handleStatChange(index: number, key: "value" | "label", val: string) {
    if (!settings) return;
    const newStats = [...settings.stats];
    newStats[index] = { ...newStats[index], [key]: val };
    setSettings({ ...settings, stats: newStats });
  }

  // ─── Redirects Actions ──────────────────────────────────────────────────────
  async function loadRedirects() {
    try {
      setRedirectsLoading(true);
      const data = await AdminRedirectAPI.getAll();
      setRedirects(data || []);
    } catch {
      triggerSeoToast("Failed to load URL redirects", "error");
    } finally {
      setRedirectsLoading(false);
    }
  }

  async function handleCreateRedirect(e: FormEvent) {
    e.preventDefault();
    if (!newSourcePath || !newTargetPath) return;
    try {
      const created = await AdminRedirectAPI.create({
        sourcePath: newSourcePath.startsWith("/") ? newSourcePath : "/" + newSourcePath,
        targetPath: newTargetPath,
        redirectType: newRedirectType,
      });
      setRedirects((prev) => [created, ...prev]);
      setNewSourcePath("");
      setNewTargetPath("");
      triggerSeoToast("301/302 Redirect created successfully!", "success");
    } catch {
      triggerSeoToast("Failed to create redirect rule", "error");
    }
  }

  async function handleDeleteRedirect(id?: number) {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this redirect rule?")) return;
    try {
      await AdminRedirectAPI.delete(id);
      setRedirects((prev) => prev.filter((r) => r.id !== id));
      triggerSeoToast("Redirect rule deleted", "success");
    } catch {
      triggerSeoToast("Failed to delete redirect rule", "error");
    }
  }

  // ─── Helpers ───
  const filteredSeo = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const seoScore = (item: SeoItem) => {
    let score = 0;
    if (item.seo?.metaTitle) score += 20;
    if (item.seo?.metaDescription) score += 20;
    if (item.seo?.keywords && item.seo.keywords.length >= 1) score += 20;
    if (item.seo?.canonicalUrl) score += 15;
    if (item.seo?.ogTitle) score += 10;
    if (item.seo?.ogDescription) score += 10;
    if (item.seo?.ogImage) score += 5;
    return score;
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  // Live Score Calculator
  const getLiveScore = () => {
    let score = 0;
    if (seoForm.metaTitle) score += 20;
    if (seoForm.metaDescription) score += 20;
    if (seoForm.keywords && seoForm.keywords.length >= 1) score += 20;
    if (seoForm.canonicalUrl) score += 15;
    if (seoForm.ogTitle) score += 10;
    if (seoForm.ogDescription) score += 10;
    if (seoForm.ogImage) score += 5;
    return score;
  };

  const liveScore = getLiveScore();
  const titleLen = seoForm.metaTitle?.length || 0;
  const isTitleValid = titleLen >= 30 && titleLen <= 60;
  const descLen = seoForm.metaDescription?.length || 0;
  const isDescValid = descLen >= 120 && descLen <= 160;
  const keywordsCount = typeof seoForm.keywords === "string" 
    ? (seoForm.keywords as string).split(",").map(k => k.trim()).filter(Boolean).length 
    : (seoForm.keywords?.length || 0);
  const isKeywordsValid = keywordsCount >= 1;
  const isCanonicalValid = !seoForm.canonicalUrl || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(seoForm.canonicalUrl);
  const isOgTitleValid = !!seoForm.ogTitle;
  const isOgDescValid = !!seoForm.ogDescription;
  const isOgImageValid = !!seoForm.ogImage;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-6 md:p-8">
      {/* Toast Alert Popups */}
      {seoToast && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-55 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-slide-in border",
            seoToast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          {seoToast.msg}
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Content & SEO Workspace
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 max-w-xl">
            Optimize meta keywords, canonical tags, Open Graph layouts, and custom site configurations for {brandId}.
          </p>
        </div>
        
        <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
          <button 
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
              activeTab === "seo"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )} 
            onClick={() => handleTabChange("seo")}
          >
            🔍 SEO Optimizer
          </button>

          <button 
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
              activeTab === "analytics"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )} 
            onClick={() => handleTabChange("analytics")}
          >
            📊 Analytics & Tags
          </button>

          <button 
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
              activeTab === "redirects"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )} 
            onClick={() => handleTabChange("redirects")}
          >
            🔀 Redirects Manager
          </button>

          {(userRole !== "SEO" && userRole !== "SEO_CW_PRODUCT_MANAGER") && (
            <button 
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
                activeTab === "settings"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              )} 
              onClick={() => handleTabChange("settings")}
            >
              🏠 Brand Configurations
            </button>
          )}
        </div>
      </div>

      {/* ─── SEO Tab Content ─── */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          {editing && (
            <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-4">
                  <span 
                    className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors select-none" 
                    onClick={() => {
                      if (confirm("Any unsaved changes will be lost. Exit?")) {
                        setEditing(null);
                      }
                    }} 
                    title="Exit Workspace"
                  >
                    ←
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Editing SEO: {editing.name}
                  </h2>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                    editing.type === "product" 
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" 
                      : "bg-purple-500/10 border-purple-500/20 text-purple-600"
                  )}>
                    {editing.type}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 mr-3 select-none">
                    <span className="text-xs font-semibold text-zinc-500">Live SEO Score:</span>
                    <span 
                      style={{ color: scoreColor(liveScore), backgroundColor: scoreColor(liveScore) + "1a", borderColor: scoreColor(liveScore) + "26" }}
                      className="text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-current"
                    >
                      {liveScore}%
                    </span>
                  </div>

                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={seoSaving}
                    onClick={() => saveSeo(true)}
                  >
                    Save Draft
                  </Button>
                  <Button 
                    size="sm"
                    disabled={seoSaving}
                    onClick={() => saveSeo(false)}
                  >
                    Save & Exit
                  </Button>
                  <button 
                    className="text-zinc-450 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
                    onClick={() => {
                      if (confirm("Any unsaved changes will be lost. Exit?")) {
                        setEditing(null);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Audit Sidebar */}
                <aside className="w-80 bg-zinc-55 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">SEO Audit Checklist</h3>
                  <div className="space-y-3 flex-1">
                    {[
                      { passed: isTitleValid, title: "Meta Title Length", desc: `Title is ${titleLen} chars (Goal: 30-60)` },
                      { passed: isDescValid, title: "Meta Description Length", desc: `Desc is ${descLen} chars (Goal: 120-160)` },
                      { passed: isKeywordsValid, title: "Keywords Count", desc: `${keywordsCount} keywords added (Goal: >= 1)` },
                      { passed: isCanonicalValid, title: "Canonical URL Format", desc: seoForm.canonicalUrl ? (isCanonicalValid ? "Valid format" : "Invalid format") : "Missing canonical URL" },
                      { passed: isOgTitleValid, title: "Open Graph Title", desc: isOgTitleValid ? "OG Title is set" : "OG Title is missing" },
                      { passed: isOgDescValid, title: "Open Graph Description", desc: isOgDescValid ? "OG Desc is set" : "OG Desc is missing" },
                      { passed: isOgImageValid, title: "Open Graph Image", desc: isOgImageValid ? "OG Image URL is set" : "OG Image URL is missing" }
                    ].map((check, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex gap-3 p-3 rounded-lg border text-xs items-start",
                          check.passed 
                            ? "border-emerald-500/20 bg-emerald-500/5 text-zinc-800 dark:text-zinc-200" 
                            : "border-amber-500/20 bg-amber-500/5 text-zinc-800 dark:text-zinc-200"
                        )}
                      >
                        <span className="text-sm shrink-0">{check.passed ? "✅" : "⚠️"}</span>
                        <div className="space-y-0.5">
                          <span className="font-semibold block">{check.title}</span>
                          <span className="text-[10px] text-zinc-400 block">{check.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-900 dark:text-white">
                      <span>Completion Score</span>
                      <span>{liveScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${liveScore}%`, backgroundColor: scoreColor(liveScore) }} 
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </aside>

                {/* Right Editing Canvas */}
                <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-950">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="border border-zinc-200 dark:border-zinc-800 p-6 bg-card">
                      <CardHeader className="px-0 pt-0 pb-4 border-b border-zinc-200 dark:border-zinc-850 mb-6">
                        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">🔍 Basic SEO Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                            <span>Meta Title</span>
                            <span style={{ color: isTitleValid ? "#10b981" : "#f59e0b" }} className="font-mono">{titleLen}/60</span>
                          </div>
                          <Input
                            type="text"
                            value={seoForm.metaTitle || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                            placeholder="Recommended: 30-60 characters"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                            <span>Meta Description</span>
                            <span style={{ color: isDescValid ? "#10b981" : "#f59e0b" }} className="font-mono">{descLen}/160</span>
                          </div>
                          <textarea
                            value={seoForm.metaDescription || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                            placeholder="Recommended: 120-160 characters"
                            rows={3}
                            className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1.5 text-sm text-zinc-900 dark:text-white shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                            <span>Keywords (Comma separated)</span>
                            <span style={{ color: isKeywordsValid ? "#10b981" : "#f59e0b" }} className="font-mono">{keywordsCount} added</span>
                          </div>
                          <Input
                            type="text"
                            value={typeof seoForm.keywords === "string" ? seoForm.keywords : (seoForm.keywords || []).join(", ")}
                            onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                            placeholder="e.g. cloud migrator, google drive to onedrive, backup email"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                            <span>Canonical URL</span>
                            <span style={{ color: isCanonicalValid ? "#10b981" : "#ef4444" }} className="font-mono">{seoForm.canonicalUrl ? "Checked" : "Optional"}</span>
                          </div>
                          <Input
                            type="text"
                            value={seoForm.canonicalUrl || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                            placeholder="e.g. https://www.prismmigration.com/products/cloud-migrator"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-zinc-200 dark:border-zinc-800 p-6 bg-card">
                      <CardHeader className="px-0 pt-0 pb-4 border-b border-zinc-200 dark:border-zinc-850 mb-6">
                        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">🌐 Social Open Graph Tags (OG)</CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500">OG Title</label>
                          <Input
                            type="text"
                            value={seoForm.ogTitle || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
                            placeholder="Social share title card..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500">OG Description</label>
                          <textarea
                            value={seoForm.ogDescription || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, ogDescription: e.target.value })}
                            placeholder="Social share description summary..."
                            rows={2}
                            className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1.5 text-sm text-zinc-900 dark:text-white shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500">OG Preview Image URL</label>
                          <Input
                            type="text"
                            value={seoForm.ogImage || ""}
                            onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                            placeholder="Preview thumbnail image location link..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </main>
              </div>
            </div>
          )}

          {/* Search Filters Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all border-0 bg-transparent cursor-pointer",
                  filter === "all" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500"
                )}
                onClick={() => setFilter("all")}
              >
                All Items
              </button>
              <button
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all border-0 bg-transparent cursor-pointer",
                  filter === "product" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500"
                )}
                onClick={() => setFilter("product")}
              >
                Products
              </button>
              <button
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all border-0 bg-transparent cursor-pointer",
                  filter === "blog" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500"
                )}
                onClick={() => setFilter("blog")}
              >
                Blogs
              </button>
            </div>
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {seoLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
              <span className="w-8 h-8 rounded-full border-3 border-zinc-200 border-t-blue-500 animate-spin" />
              <span className="text-xs font-semibold">Loading SEO indices...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSeo.map((item) => {
                const score = seoScore(item);
                const color = scoreColor(score);
                return (
                  <Card key={`${item.type}-${item.id}`} className="border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          item.type === "product" 
                            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" 
                            : "bg-purple-500/10 border-purple-500/20 text-purple-600"
                        )}>
                          {item.type}
                        </span>
                        <span 
                          style={{ color, backgroundColor: color + "1a", borderColor: color + "26" }}
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-current"
                        >
                          {score}%
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold mt-2 line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="font-mono text-[10px]">/{item.slug}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-zinc-400 shrink-0">Title:</span>
                          <span className={cn("truncate text-right text-zinc-900 dark:text-zinc-100", !item.seo?.metaTitle && "text-amber-500")}>
                            {item.seo?.metaTitle || "⚠️ Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-zinc-400 shrink-0">Desc:</span>
                          <span className={cn("truncate text-right text-zinc-900 dark:text-zinc-100", !item.seo?.metaDescription && "text-amber-500")}>
                            {item.seo?.metaDescription || "⚠️ Not set"}
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => openSeoEditor(item)}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs font-semibold"
                      >
                        Optimize SEO
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Analytics & Tags Tab Content ─── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {settingsLoading ? (
            <div className="flex items-center justify-center p-12 text-sm text-zinc-500">
              <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading Analytics & Verification configurations...
            </div>
          ) : settings ? (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {settingsSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  {settingsSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analytics & Tracking Scripts */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
                  <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>📊 Traffic & Behavioral Tracking IDs</span>
                    </CardTitle>
                    <CardDescription>
                      Inject Google Analytics 4, Tag Manager, and Microsoft Clarity tracking scripts into the storefront automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Google Analytics 4 Measurement ID</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.gaMeasurementId || ""}
                        onChange={(e) => handleSeoDefaultChange("gaMeasurementId", e.target.value)}
                        placeholder="e.g. G-XXXXXXXXXX"
                      />
                      <p className="text-[10px] text-zinc-400">Found in Google Analytics Admin &gt; Data Streams.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Google Tag Manager (GTM) Container ID</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.gtmContainerId || ""}
                        onChange={(e) => handleSeoDefaultChange("gtmContainerId", e.target.value)}
                        placeholder="e.g. GTM-XXXXXXX"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Microsoft Clarity Project ID</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.clarityProjectId || ""}
                        onChange={(e) => handleSeoDefaultChange("clarityProjectId", e.target.value)}
                        placeholder="e.g. xxxxxxxxxx (for free heatmaps & recordings)"
                      />
                      <p className="text-[10px] text-zinc-400">Generates heatmaps & user session recordings for conversion optimization.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Console & Webmaster Verification */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
                  <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>🔍 Search Engine Verification Tags</span>
                    </CardTitle>
                    <CardDescription>
                      Prove domain ownership to Google Search Console and Bing Webmaster Tools.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Google Search Console Verification Tag</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.googleVerification || ""}
                        onChange={(e) => handleSeoDefaultChange("googleVerification", e.target.value)}
                        placeholder="Meta tag content code snippet from Search Console..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Bing Webmaster Verification Code</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.bingVerification || ""}
                        onChange={(e) => handleSeoDefaultChange("bingVerification", e.target.value)}
                        placeholder="msvalidate.01 meta content code..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Default Social OpenGraph (OG) Image URL</label>
                      <Input
                        type="text"
                        value={settings.seoDefaults?.defaultOgImage || ""}
                        onChange={(e) => handleSeoDefaultChange("defaultOgImage", e.target.value)}
                        placeholder="https://prismmigration.com/og-default.png"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Robots.txt Editor */}
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>🤖 Robots.txt Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Control which web crawlers and search engine bots can index specific routes on your storefront.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <textarea
                    value={settings.seoDefaults?.robotsTxt || ""}
                    onChange={(e) => handleSeoDefaultChange("robotsTxt", e.target.value)}
                    rows={6}
                    className="w-full font-mono text-xs bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-lg p-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25"
                    placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://prismmigration.com/sitemap.xml"
                  />
                  <p className="text-[10px] text-zinc-400">Rendered dynamically at <code>/robots.txt</code>.</p>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={settingsSaving} className="shadow-sm">
                  {settingsSaving ? (
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin" />
                  ) : (
                    "Save Analytics & Verification Settings"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-10 text-sm text-zinc-500">No settings configurations found.</div>
          )}
        </div>
      )}

      {/* ─── Redirects Tab Content ─── */}
      {activeTab === "redirects" && (
        <div className="space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-zinc-900 dark:text-white">🔀 Add Custom URL Redirect Rule</CardTitle>
              <CardDescription>
                Create 301 Permanent or 302 Temporary HTTP redirects for broken or relocated paths.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRedirect} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-semibold text-zinc-500">Old Source Path</label>
                  <Input
                    type="text"
                    value={newSourcePath}
                    onChange={(e) => setNewSourcePath(e.target.value)}
                    placeholder="/old-pst-converter-page"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-semibold text-zinc-500">New Target Path or URL</label>
                  <Input
                    type="text"
                    value={newTargetPath}
                    onChange={(e) => setNewTargetPath(e.target.value)}
                    placeholder="/products/pst-to-pdf-converter"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-semibold text-zinc-500">Redirect Type</label>
                  <Select
                    value={newRedirectType.toString()}
                    onChange={(e) => setNewRedirectType(Number(e.target.value))}
                  >
                    <option value="301">301 Permanent (SEO Link Juice Pass)</option>
                    <option value="302">302 Temporary (Testing)</option>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Button type="submit" className="w-full">
                    + Add Redirect Rule
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Redirects Table */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-zinc-900 dark:text-white">Active Redirect Rules ({redirects.length})</CardTitle>
                <CardDescription>Resolved in real-time via Astro middleware before pages render.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {redirectsLoading ? (
                <div className="p-8 text-center text-xs text-zinc-500">Loading active redirect rules...</div>
              ) : redirects.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">No redirect rules created yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Old Source Path</TableHead>
                      <TableHead>Target Destination</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redirects.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{r.sourcePath}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">{r.targetPath}</TableCell>
                        <TableCell>
                          <Badge variant={r.redirectType === 301 ? "default" : "secondary"}>
                            HTTP {r.redirectType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRedirect(r.id)}
                            className="h-7 text-[11px]"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Settings Tab Content ─── */}
      {activeTab === "settings" && (userRole !== "SEO" && userRole !== "SEO_CW_PRODUCT_MANAGER") && (
        <div className="space-y-6">
          {settingsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
              <span className="w-8 h-8 rounded-full border-3 border-zinc-200 border-t-blue-500 animate-spin" />
              <span className="text-xs font-semibold">Loading storefront configurations...</span>
            </div>
          ) : settings ? (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {settingsSuccess && (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-5/50 text-xs font-semibold text-emerald-600">
                  {settingsSuccess}
                </div>
              )}
              {settingsError && (
                <div className="p-3.5 rounded-lg border border-red-205 bg-red-5/50 text-xs font-semibold text-red-600">
                  {settingsError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
                  <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-white">🏠 Brand Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Storefront Name</label>
                      <Input
                        type="text"
                        value={settings.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Home Page Tagline</label>
                      <Input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => handleFieldChange("tagline", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Meta Description</label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        rows={3}
                        required
                        className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none text-zinc-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-card">
                  <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-white">📞 Contact Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Support Email</label>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Support Phone</label>
                      <Input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Office Address</label>
                      <Input
                        type="text"
                        value={settings.address}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-855">
                <Button type="submit" disabled={settingsSaving} className="shadow-sm">
                  {settingsSaving ? (
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Configurations
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-10 text-sm text-zinc-500">No settings configurations seeded.</div>
          )}
        </div>
      )}
    </div>
  );
}
