"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/app/(dashboard)/layout";
import { AdminSettingsAPI } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

type BrandTab = "identity" | "theme" | "navigation" | "hero" | "contact" | "legal" | "announcement" | "about";

interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  darkMode: boolean;
  logoUrl: string;
  faviconUrl: string;
  navbarStyle: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
  children?: NavItem[];
}

interface HeroConfig {
  headline: string;
  subheadline: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  badgeText: string;
}

interface AnnouncementBar {
  text: string;
  link: string;
  enabled: boolean;
  bgColor: string;
  textColor: string;
}

interface AboutPageConfig {
  heroTitle: string;
  heroDescription: string;
  missionTitle: string;
  missionContent: string;
  showTeam: boolean;
  showStats: boolean;
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
  socials: { twitter: string; linkedin: string; youtube: string; facebook: string; github: string };
  theme?: ThemeConfig;
  mainNavigation?: NavItem[];
  hero?: HeroConfig;
  announcement?: AnnouncementBar;
  aboutPage?: AboutPageConfig;
  legalPages?: Record<string, string>;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#2563eb",
  accentColor: "#f59e0b",
  fontFamily: "Inter",
  darkMode: false,
  logoUrl: "",
  faviconUrl: "",
  navbarStyle: "solid",
};

const defaultHero: HeroConfig = {
  headline: "Professional Software Tools for Data Migration",
  subheadline: "Industry-leading tools trusted by 1M+ users worldwide.",
  ctaPrimaryText: "View Products",
  ctaPrimaryHref: "/products",
  ctaSecondaryText: "Free Trial",
  ctaSecondaryHref: "/download",
  badgeText: "Trusted by 50,000+ IT Professionals",
};

const defaultAnnouncement: AnnouncementBar = {
  text: "",
  link: "",
  enabled: false,
  bgColor: "#6366f1",
  textColor: "#ffffff",
};

const defaultAbout: AboutPageConfig = {
  heroTitle: "Trusted by IT Professionals Across the Globe",
  heroDescription: "We build the world's most reliable data management software.",
  missionTitle: "Data Migration Should Be Simple, Safe & Reliable",
  missionContent: "",
  showTeam: true,
  showStats: true,
};

const defaultNav: NavItem[] = [
  { label: "Products", href: "/products", icon: "package", enabled: true },
  { label: "Pricing", href: "/pricing", icon: "dollar", enabled: true },
  { label: "Download", href: "/download", icon: "download", enabled: true },
  { label: "Blog", href: "/blog", icon: "file-text", enabled: true },
  { label: "Help", href: "/help", icon: "help-circle", enabled: true },
  { label: "About", href: "/about", icon: "info", enabled: true },
  { label: "Contact", href: "/contact", icon: "mail", enabled: true },
];

export default function BrandManagerPage() {
  const params = useParams();
  const brandId = (params?.brandId as string) || "";
  const { theme: adminTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<BrandTab>("identity");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { loadSettings(); }, [brandId]);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await AdminSettingsAPI.get();
      setSettings({
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
        theme: data.theme || { ...defaultTheme },
        mainNavigation: data.mainNavigation || [...defaultNav],
        hero: data.hero || { ...defaultHero },
        announcement: data.announcement || { ...defaultAnnouncement },
        aboutPage: data.aboutPage || { ...defaultAbout },
        legalPages: data.legalPages || {},
      });
    } catch {
      showToast("Failed to load brand settings", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      const payload = { ...settings, siteId: brandId };
      const updated = await AdminSettingsAPI.update(payload);
      setSettings(prev => prev ? { ...prev, id: updated.id } : prev);
      showToast("Brand settings saved successfully!", "success");
    } catch {
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  function updateTheme(field: keyof ThemeConfig, value: any) {
    if (!settings) return;
    setSettings({ ...settings, theme: { ...(settings.theme || defaultTheme), [field]: value } });
  }

  function updateHero(field: keyof HeroConfig, value: string) {
    if (!settings) return;
    setSettings({ ...settings, hero: { ...(settings.hero || defaultHero), [field]: value } });
  }

  function updateAnnouncement(field: keyof AnnouncementBar, value: any) {
    if (!settings) return;
    setSettings({ ...settings, announcement: { ...(settings.announcement || defaultAnnouncement), [field]: value } });
  }

  function updateAbout(field: keyof AboutPageConfig, value: any) {
    if (!settings) return;
    setSettings({ ...settings, aboutPage: { ...(settings.aboutPage || defaultAbout), [field]: value } });
  }

  function updateLegalPage(key: string, html: string) {
    if (!settings) return;
    setSettings({ ...settings, legalPages: { ...(settings.legalPages || {}), [key]: html } });
  }

  function updateSocial(field: string, value: string) {
    if (!settings) return;
    setSettings({ ...settings, socials: { ...settings.socials, [field]: value } });
  }

  function toggleNavItem(idx: number) {
    if (!settings || !settings.mainNavigation) return;
    const nav = [...settings.mainNavigation];
    nav[idx] = { ...nav[idx], enabled: !nav[idx].enabled };
    setSettings({ ...settings, mainNavigation: nav });
  }

  function updateNavItem(idx: number, field: keyof NavItem, value: string) {
    if (!settings || !settings.mainNavigation) return;
    const nav = [...settings.mainNavigation];
    nav[idx] = { ...nav[idx], [field]: value };
    setSettings({ ...settings, mainNavigation: nav });
  }

  function addNavItem() {
    if (!settings) return;
    const nav = [...(settings.mainNavigation || []), { label: "New Link", href: "/", icon: "", enabled: true }];
    setSettings({ ...settings, mainNavigation: nav });
  }

  function removeNavItem(idx: number) {
    if (!settings || !settings.mainNavigation) return;
    const nav = settings.mainNavigation.filter((_, i) => i !== idx);
    setSettings({ ...settings, mainNavigation: nav });
  }

  const tabs: { id: BrandTab; label: string }[] = [
    { id: "identity", label: "Identity" },
    { id: "theme", label: "Theme & Branding" },
    { id: "navigation", label: "Navigation Links" },
    { id: "hero", label: "Home Hero Block" },
    { id: "contact", label: "Support & Socials" },
    { id: "legal", label: "Legal Pages" },
    { id: "announcement", label: "Announcement Bar" },
    { id: "about", label: "About Page Config" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500 dark:text-zinc-400">
        <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
        <span className="text-xs font-semibold">Loading brand settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center py-20 text-zinc-500 dark:text-zinc-400">
        <span className="text-xs font-semibold">No brand settings found. Contact the Super Admin.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold shadow-lg backdrop-blur-md animate-fade-in",
          toast.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Brand Manager</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Configure identity, navigation, legal policies, and announcements for{" "}
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
              {brandId}
            </span>
          </p>
        </div>
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          size="sm"
          className="h-9 px-4 shadow-sm"
        >
          {saving ? (
            <span className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin" />
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Brand Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start mt-6">
        {/* Left Sidebar Tabs */}
        <aside className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:sticky md:top-20">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all whitespace-nowrap cursor-pointer",
                activeTab === t.id
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* Right Content */}
        <main className="flex-1 max-w-3xl space-y-6">
          {/* IDENTITY TAB */}
          {activeTab === "identity" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>🏠 Brand Identity</CardTitle>
                <CardDescription>Configure the basic storefront metadata and identification details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Storefront Name</label>
                  <Input type="text" value={settings.name} onChange={e => updateField("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Home Page Tagline</label>
                  <Input type="text" value={settings.tagline} onChange={e => updateField("tagline", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Meta Description</label>
                  <textarea
                    value={settings.description}
                    onChange={e => updateField("description", e.target.value)}
                    rows={3}
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Site URL</label>
                  <Input type="url" value={settings.url} onChange={e => updateField("url", e.target.value)} placeholder="https://www.example.com" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* THEME TAB */}
          {activeTab === "theme" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>🎨 Theme & Branding</CardTitle>
                <CardDescription>Customize the storefront style system and visual assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Primary Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.theme?.primaryColor || "#2563eb"}
                        onChange={e => updateTheme("primaryColor", e.target.value)}
                        className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-zinc-100 dark:bg-zinc-850"
                      />
                      <Input
                        type="text"
                        value={settings.theme?.primaryColor || "#2563eb"}
                        onChange={e => updateTheme("primaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.theme?.accentColor || "#f59e0b"}
                        onChange={e => updateTheme("accentColor", e.target.value)}
                        className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-zinc-100 dark:bg-zinc-850"
                      />
                      <Input
                        type="text"
                        value={settings.theme?.accentColor || "#f59e0b"}
                        onChange={e => updateTheme("accentColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Font Family</label>
                    <Select
                      value={settings.theme?.fontFamily || "Inter"}
                      onChange={e => updateTheme("fontFamily", e.target.value)}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Navbar Style</label>
                    <Select
                      value={settings.theme?.navbarStyle || "solid"}
                      onChange={e => updateTheme("navbarStyle", e.target.value)}
                    >
                      <option value="solid">Solid</option>
                      <option value="transparent">Transparent</option>
                      <option value="gradient">Gradient</option>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Logo URL</label>
                    <Input
                      type="text"
                      value={settings.theme?.logoUrl || ""}
                      onChange={e => updateTheme("logoUrl", e.target.value)}
                      placeholder="Upload via file upload or paste URL"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Favicon URL</label>
                    <Input
                      type="text"
                      value={settings.theme?.faviconUrl || ""}
                      onChange={e => updateTheme("faviconUrl", e.target.value)}
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-150 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Live Color Preview</p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div
                      style={{ backgroundColor: settings.theme?.primaryColor || "#2563eb" }}
                      className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                    >
                      Primary
                    </div>
                    <div
                      style={{ backgroundColor: settings.theme?.accentColor || "#f59e0b" }}
                      className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                    >
                      Accent
                    </div>
                    <span
                      style={{ fontFamily: settings.theme?.fontFamily || "Inter" }}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Sample Text Preview ({settings.theme?.fontFamily || "Inter"})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NAVIGATION TAB */}
          {activeTab === "navigation" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle>📱 Main Navigation</CardTitle>
                  <CardDescription>Configure menu links in the header.</CardDescription>
                </div>
                <Button
                  onClick={addNavItem}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-dashed"
                >
                  <span className="text-sm">+</span> Add Link
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {(settings.mainNavigation || []).length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                    No navigation items added yet. Click "+ Add Link" to create one.
                  </div>
                ) : (
                  (settings.mainNavigation || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      <Input
                        type="text"
                        value={item.label}
                        onChange={e => updateNavItem(idx, "label", e.target.value)}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        value={item.href}
                        onChange={e => updateNavItem(idx, "href", e.target.value)}
                        placeholder="/path"
                        className="flex-1"
                      />
                      <div className="flex items-center justify-between gap-3 sm:justify-start">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => toggleNavItem(idx)}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
                          />
                          <span className={item.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                            {item.enabled ? "Active" : "Disabled"}
                          </span>
                        </label>
                        <Button
                          variant="ghost"
                          onClick={() => removeNavItem(idx)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-0"
                          title="Remove item"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* HERO TAB */}
          {activeTab === "hero" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>🏗️ Home Page Hero</CardTitle>
                <CardDescription>Update the welcome section content and main calls-to-action.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Badge Text</label>
                  <Input
                    type="text"
                    value={settings.hero?.badgeText || ""}
                    onChange={e => updateHero("badgeText", e.target.value)}
                    placeholder="e.g. Trusted by 50,000+ IT Professionals"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Headline</label>
                  <Input
                    type="text"
                    value={settings.hero?.headline || ""}
                    onChange={e => updateHero("headline", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sub-headline</label>
                  <textarea
                    value={settings.hero?.subheadline || ""}
                    onChange={e => updateHero("subheadline", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Primary CTA Text</label>
                    <Input type="text" value={settings.hero?.ctaPrimaryText || ""} onChange={e => updateHero("ctaPrimaryText", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Primary CTA Link</label>
                    <Input type="text" value={settings.hero?.ctaPrimaryHref || ""} onChange={e => updateHero("ctaPrimaryHref", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Secondary CTA Text</label>
                    <Input type="text" value={settings.hero?.ctaSecondaryText || ""} onChange={e => updateHero("ctaSecondaryText", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Secondary CTA Link</label>
                    <Input type="text" value={settings.hero?.ctaSecondaryHref || ""} onChange={e => updateHero("ctaSecondaryHref", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CONTACT & SOCIALS TAB */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle>📞 Contact Details</CardTitle>
                  <CardDescription>Support channels shown on public help/contact endpoints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Support Email</label>
                      <Input type="email" value={settings.email} onChange={e => updateField("email", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Support Phone</label>
                      <Input type="text" value={settings.phone} onChange={e => updateField("phone", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Office Address</label>
                      <Input type="text" value={settings.address} onChange={e => updateField("address", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle>🌐 Social Media Links</CardTitle>
                  <CardDescription>Public links added to footers or header icons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(["twitter", "linkedin", "youtube", "facebook", "github"] as const).map(s => (
                      <div key={s} className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 capitalize">{s}</label>
                        <Input
                          type="url"
                          value={(settings.socials as any)[s] || ""}
                          onChange={e => updateSocial(s, e.target.value)}
                          placeholder={`https://${s}.com/...`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* LEGAL PAGES TAB */}
          {activeTab === "legal" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>📄 Legal Pages (HTML)</CardTitle>
                <CardDescription>These documents will render at /privacy, /terms, /refund, and /license on the storefront.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "privacy", label: "Privacy Policy" },
                  { key: "terms", label: "Terms of Service" },
                  { key: "refund", label: "Refund Policy" },
                  { key: "license", label: "License Agreement" },
                ].map(page => (
                  <div key={page.key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{page.label}</label>
                    <textarea
                      value={settings.legalPages?.[page.key] || ""}
                      onChange={e => updateLegalPage(page.key, e.target.value)}
                      rows={6}
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                      placeholder={`Enter HTML content for ${page.label}...`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ANNOUNCEMENT TAB */}
          {activeTab === "announcement" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>📢 Announcement Bar</CardTitle>
                <CardDescription>Alert bar displayed at the very top of pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={settings.announcement?.enabled || false}
                      onChange={e => updateAnnouncement("enabled", e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
                    />
                    <span className={settings.announcement?.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                      {settings.announcement?.enabled ? "Active Banner" : "Hidden Banner"}
                    </span>
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Announcement Text</label>
                  <Input
                    type="text"
                    value={settings.announcement?.text || ""}
                    onChange={e => updateAnnouncement("text", e.target.value)}
                    placeholder="🎉 Summer Sale — 20% off all products!"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Link URL</label>
                  <Input
                    type="text"
                    value={settings.announcement?.link || ""}
                    onChange={e => updateAnnouncement("link", e.target.value)}
                    placeholder="/products or https://..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.announcement?.bgColor || "#6366f1"}
                        onChange={e => updateAnnouncement("bgColor", e.target.value)}
                        className="w-9 h-8 p-0 border-0 cursor-pointer rounded bg-zinc-100 dark:bg-zinc-850"
                      />
                      <Input
                        type="text"
                        value={settings.announcement?.bgColor || "#6366f1"}
                        onChange={e => updateAnnouncement("bgColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.announcement?.textColor || "#ffffff"}
                        onChange={e => updateAnnouncement("textColor", e.target.value)}
                        className="w-9 h-8 p-0 border-0 cursor-pointer rounded bg-zinc-100 dark:bg-zinc-850"
                      />
                      <Input
                        type="text"
                        value={settings.announcement?.textColor || "#ffffff"}
                        onChange={e => updateAnnouncement("textColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                {settings.announcement?.enabled && settings.announcement?.text && (
                  <div
                    style={{
                      backgroundColor: settings.announcement.bgColor || "#6366f1",
                      color: settings.announcement.textColor || "#ffffff"
                    }}
                    className="mt-4 p-3 rounded-lg text-center text-xs font-bold shadow-sm animate-fade-in"
                  >
                    {settings.announcement.text}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ABOUT PAGE TAB */}
          {activeTab === "about" && (
            <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>👥 About Page Config</CardTitle>
                <CardDescription>Configure layouts and dynamic listings for /about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Hero Title</label>
                  <Input type="text" value={settings.aboutPage?.heroTitle || ""} onChange={e => updateAbout("heroTitle", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Hero Description</label>
                  <textarea
                    value={settings.aboutPage?.heroDescription || ""}
                    onChange={e => updateAbout("heroDescription", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Mission Title</label>
                  <Input type="text" value={settings.aboutPage?.missionTitle || ""} onChange={e => updateAbout("missionTitle", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Mission Content (HTML)</label>
                  <textarea
                    value={settings.aboutPage?.missionContent || ""}
                    onChange={e => updateAbout("missionContent", e.target.value)}
                    rows={5}
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                  />
                </div>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={settings.aboutPage?.showTeam !== false}
                      onChange={e => updateAbout("showTeam", e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
                    />
                    <span>Show Team Section</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={settings.aboutPage?.showStats !== false}
                      onChange={e => updateAbout("showStats", e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
                    />
                    <span>Show Stats Section</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
