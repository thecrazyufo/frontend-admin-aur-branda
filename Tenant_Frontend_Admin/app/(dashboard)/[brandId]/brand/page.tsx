"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from"@/app/(dashboard)/layout";
import { AdminSettingsAPI } from"@/services/api";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Input } from"@/components/ui/Input";
import { Select } from"@/components/ui/Select";
import { cn } from"@/lib/utils";

type BrandTab ="identity" |"theme" |"navigation" |"hero" |"contact" |"legal" |"announcement" |"about" |"pricing" |"trust" | "careers" | "clients";

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

interface BenefitItem {
  title: string;
  description: string;
  icon: string;
}

interface JobPosition {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salaryRange: string;
  description: string;
  requirements: string;
  active: boolean;
}

interface CareersPageConfig {
  heroTitle: string;
  heroDescription: string;
  companyCultureTitle: string;
  companyCultureDesc: string;
  benefits: BenefitItem[];
  openPositions: JobPosition[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface ClientsPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface PricingComparisonRow {
  feature: string;
  trial: string | boolean;
  standard: string | boolean;
  enterprise: string | boolean;
}

interface PricingFaq {
  question: string;
  answer: string;
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
 careersPage?: CareersPageConfig;
 clientsPage?: ClientsPageConfig;
 legalPages?: Record<string, string>;
 pricingComparison?: PricingComparisonRow[];
 pricingFaqs?: PricingFaq[];
 stats?: any[];
 trustBadges?: any[];
 teamMembers?: any[];
 [key: string]: any;
}

const defaultTheme: ThemeConfig = {
 primaryColor:"#2563eb",
 accentColor:"#f59e0b",
 fontFamily:"Inter",
 darkMode: false,
 logoUrl:"",
 faviconUrl:"",
 navbarStyle:"solid",
};

const defaultHero: HeroConfig = {
 headline:"Migrate Data at Lightning Speed Without Losing a Single Byte.",
 subheadline:"Eliminate downtime and secure your enterprise data. Our automated migration tools handle emails, files, and cloud transfers in seconds—saving you thousands in IT hours.",
 ctaPrimaryText:"View Products",
 ctaPrimaryHref:"/products",
 ctaSecondaryText:"Free Trial",
 ctaSecondaryHref:"/download",
 badgeText:"Trusted by 50,000+ IT Professionals",
};

const defaultAnnouncement: AnnouncementBar = {
 text:"",
 link:"",
 enabled: false,
 bgColor:"#6366f1",
 textColor:"#ffffff",
};

const defaultAbout: AboutPageConfig = {
 heroTitle:"Trusted by IT Professionals Across the Globe",
 heroDescription:"We build the world's most reliable data management software.",
 missionTitle:"Data Migration Should Be Simple, Safe & Reliable",
 missionContent:"",
 showTeam: true,
 showStats: true,
};

const defaultCareers: CareersPageConfig = {
  heroTitle: "Join Our Team",
  heroDescription: "Help us build the future of software selling and data migration.",
  companyCultureTitle: "Our Company Culture",
  companyCultureDesc: "We value autonomy, craft, and balanced lives. We believe in doing great work without sacrificing sanity.",
  benefits: [
    { title: "Remote First", description: "Work from anywhere in the world.", icon: "Globe" },
    { title: "Health & Wellness", description: "Comprehensive premium health coverage.", icon: "Heart" },
    { title: "Learning & Growth", description: "Annual education budget for courses/books.", icon: "BookOpen" }
  ],
  openPositions: [
    {
      id: "job-1",
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote, US/Europe",
      type: "Full-Time",
      experience: "Senior (5+ years)",
      salaryRange: "$130k - $160k",
      description: "Looking for an engineer to lead feature development on our core selling platforms.",
      requirements: "• 5+ years with React, Next.js, and Java/Spring Boot\n• Experience with SQL and database design\n• Strong product sense",
      active: true
    }
  ],
  metaTitle: "Careers at Prism Migration | Join Our Team",
  metaDescription: "Explore career opportunities at Prism Migration. We are looking for talented engineers, designers, and marketers.",
  metaKeywords: "careers, jobs, engineering jobs, remote jobs"
};

const defaultClients: ClientsPageConfig = {
  heroTitle: "Trusted by Leading Organizations",
  heroSubtitle: "We help companies of all sizes migrate their enterprise data seamlessly, securely, and with zero downtime.",
  stats: [
    { value: "150+", label: "Companies Trust Us" },
    { value: "50+", label: "Countries Served" },
    { value: "10B+", label: "Items Migrated" },
    { value: "99.9%", label: "Success Rate" }
  ],
  ctaTitle: "Join Our Growing List of Clients",
  ctaText: "Ready to migrate your database, mailboxes, or cloud storage? Start your risk-free trial today or contact our integration team.",
  ctaButtonText: "Contact Sales",
  ctaButtonLink: "/contact",
  metaTitle: "Our Clients — Enterprise Data Migration Success Stories",
  metaDescription: "See how leading organizations use Prism Migration tools to translate, convert, and sync mailbox databases.",
  metaKeywords: "clients, customers, case studies, enterprise, success stories",
};

const defaultNav: NavItem[] = [
 { label:"Products", href:"/products", icon:"package", enabled: true },
 { label:"Pricing", href:"/pricing", icon:"dollar", enabled: true },
 { label:"Download", href:"/download", icon:"download", enabled: true },
 { label:"Blog", href:"/blog", icon:"file-text", enabled: true },
 { label:"Help", href:"/help", icon:"help-circle", enabled: true },
 { label:"About", href:"/about", icon:"info", enabled: true },
 { label:"Contact", href:"/contact", icon:"mail", enabled: true },
];

export default function BrandManagerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const brandId = (params?.brandId as string) || "";
  const { theme: adminTheme } = useTheme();

  const activeTab = (searchParams.get("tab") as BrandTab) || "identity";
  const setActiveTab = (tab: BrandTab) => {
    router.push(`/${brandId}/brand?tab=${tab}`);
  };

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { loadSettings(); }, [brandId]);

  useEffect(() => {
    if (!settings || !originalSettings) {
      setIsDirty(false);
      return;
    }
    const currentStr = JSON.stringify(settings);
    setIsDirty(currentStr !== originalSettings);
  }, [settings, originalSettings]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await AdminSettingsAPI.get();
      const defaultState = {
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
        careersPage: data.careersPage || { ...defaultCareers },
        clientsPage: data.clientsPage || { ...defaultClients },
        legalPages: data.legalPages || {},
        pricingComparison: data.pricingComparison || [],
        pricingFaqs: data.pricingFaqs || [],
      };
      setSettings(defaultState);
      setOriginalSettings(JSON.stringify(defaultState));
    } catch {
      // If settings don't exist yet (e.g., truncated/new database), initialize with clean defaults
      const defaultStateFallback = {
        id: "",
        siteId: brandId,
        name: brandId === "brandA" ? "Prism Migration" : brandId.toUpperCase(),
        tagline: "Enterprise Mailbox & Database Migrators",
        description: "Automated migration tools built to run locally.",
        url: `https://${brandId}.thecrazyufo.in`,
        email: `support@${brandId}.local`,
        phone: "",
        address: "",
        socials: {
          twitter: "",
          linkedin: "",
          youtube: "",
          facebook: "",
          github: "",
        },
        theme: { ...defaultTheme },
        mainNavigation: [...defaultNav],
        hero: { ...defaultHero },
        announcement: { ...defaultAnnouncement },
        aboutPage: { ...defaultAbout },
        careersPage: { ...defaultCareers },
        clientsPage: { ...defaultClients },
        legalPages: {},
        pricingComparison: [],
        pricingFaqs: [],
      };
      setSettings(defaultStateFallback);
      setOriginalSettings(JSON.stringify(defaultStateFallback));
      showToast("Initialized with default brand settings template.", "success");
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
      const savedState = { ...settings, id: updated.id };
      setSettings(savedState);
      setOriginalSettings(JSON.stringify(savedState));
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

 function updateCareers(field: keyof CareersPageConfig, value: any) {
 if (!settings) return;
 setSettings({ ...settings, careersPage: { ...(settings.careersPage || defaultCareers), [field]: value } });
 }

 function updateClients(field: keyof ClientsPageConfig, value: any) {
 if (!settings) return;
 setSettings({ ...settings, clientsPage: { ...(settings.clientsPage || defaultClients), [field]: value } });
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
 const nav = [...(settings.mainNavigation || []), { label:"New Link", href:"/", icon:"", enabled: true }];
 setSettings({ ...settings, mainNavigation: nav });
 }

 function removeNavItem(idx: number) {
 if (!settings || !settings.mainNavigation) return;
 const nav = settings.mainNavigation.filter((_, i) => i !== idx);
 setSettings({ ...settings, mainNavigation: nav });
 }

  const tabGroups: { groupTitle: string; items: { id: BrandTab; label: string }[] }[] = [
    {
      groupTitle: "Core Identity & Style",
      items: [
        { id: "identity", label: "🏠 Identity & Profile" },
        { id: "theme", label: "🎨 Theme & Branding" },
        { id: "contact", label: "📞 Support & Socials" },
      ]
    },
    {
      groupTitle: "Navigation & Headers",
      items: [
        { id: "navigation", label: "🔗 Navigation Links" },
        { id: "announcement", label: "📢 Announcement Bar" },
      ]
    },
    {
      groupTitle: "Homepage Sections",
      items: [
        { id: "hero", label: "✨ Home Hero Block" },
        { id: "trust", label: "🤝 Company & Trust" },
      ]
    },
    {
      groupTitle: "Subpage Templates",
      items: [
        { id: "pricing", label: "💳 Pricing Matrix" },
        { id: "about", label: "ℹ️ About Page Config" },
        { id: "careers", label: "💼 Careers Page" },
        { id: "clients", label: "👥 Our Clients" },
        { id: "legal", label: "⚖️ Legal & Policies" },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
        <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
        <span className="text-xs font-semibold">Loading brand settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center py-20 text-zinc-500">
        <span className="text-xs font-semibold">No brand settings found. Contact the Super Admin.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold shadow-lg backdrop-blur-md animate-fade-in",
          toast.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-red-500/20 bg-red-500/10 text-red-600"
        )}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Brand Manager</h1>
          <p className="text-xs text-zinc-500 font-medium">
            Configure identity, navigation, legal policies, and announcements for{" "}
            <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
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

 <main className="space-y-6">
 {/* IDENTITY TAB */}
 {activeTab ==="identity" && (
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>🏠 Brand Identity</CardTitle>
 <CardDescription>Configure the basic storefront metadata and identification details.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Storefront Name</label>
 <Input type="text" value={settings.name} onChange={e => updateField("name", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Home Page Tagline</label>
 <Input type="text" value={settings.tagline} onChange={e => updateField("tagline", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Meta Description</label>
 <textarea
 value={settings.description}
 onChange={e => updateField("description", e.target.value)}
 rows={3}
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Site URL</label>
 <Input type="url" value={settings.url} onChange={e => updateField("url", e.target.value)} placeholder="https://www.example.com" />
 </div>
 </CardContent>
 </Card>
 )}

 {/* THEME TAB */}
 {activeTab ==="theme" && (
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>🎨 Theme & Branding</CardTitle>
 <CardDescription>Customize the storefront style system and visual assets.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Primary Color</label>
 <div className="flex gap-2 items-center">
 <input
 type="color"
 value={settings.theme?.primaryColor ||"#2563eb"}
 onChange={e => updateTheme("primaryColor", e.target.value)}
 className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-muted"
 />
 <Input
 type="text"
 value={settings.theme?.primaryColor ||"#2563eb"}
 onChange={e => updateTheme("primaryColor", e.target.value)}
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Accent Color</label>
 <div className="flex gap-2 items-center">
 <input
 type="color"
 value={settings.theme?.accentColor ||"#f59e0b"}
 onChange={e => updateTheme("accentColor", e.target.value)}
 className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-muted"
 />
 <Input
 type="text"
 value={settings.theme?.accentColor ||"#f59e0b"}
 onChange={e => updateTheme("accentColor", e.target.value)}
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Font Family</label>
 <Select
 value={settings.theme?.fontFamily ||"Inter"}
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
 <label className="text-xs font-semibold text-zinc-500">Navbar Style</label>
 <Select
 value={settings.theme?.navbarStyle ||"solid"}
 onChange={e => updateTheme("navbarStyle", e.target.value)}
 >
 <option value="solid">Solid</option>
 <option value="transparent">Transparent</option>
 <option value="gradient">Gradient</option>
 </Select>
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Logo URL</label>
 <Input
 type="text"
 value={settings.theme?.logoUrl ||""}
 onChange={e => updateTheme("logoUrl", e.target.value)}
 placeholder="Upload via file upload or paste URL"
 />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Favicon URL</label>
 <Input
 type="text"
 value={settings.theme?.faviconUrl ||""}
 onChange={e => updateTheme("faviconUrl", e.target.value)}
 placeholder="/favicon.ico"
 />
 </div>
 </div>

 {/* Live Preview */}
 <div className="mt-6 p-4 bg-card rounded-lg border border-zinc-150">
 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Live Color Preview</p>
 <div className="flex flex-wrap gap-4 items-center">
 <div
 style={{ backgroundColor: settings.theme?.primaryColor ||"#2563eb" }}
 className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
 >
 Primary
 </div>
 <div
 style={{ backgroundColor: settings.theme?.accentColor ||"#f59e0b" }}
 className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
 >
 Accent
 </div>
 <span
 style={{ fontFamily: settings.theme?.fontFamily ||"Inter" }}
 className="text-xs font-medium text-zinc-700"
 >
 Sample Text Preview ({settings.theme?.fontFamily ||"Inter"})
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* NAVIGATION TAB */}
 {activeTab ==="navigation" && (
 <Card className=" border border-zinc-200 shadow-sm">
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
 <div className="text-center py-8 text-xs text-zinc-500">
 No navigation items added yet. Click"+ Add Link" to create one.
 </div>
 ) : (
 (settings.mainNavigation || []).map((item, idx) => (
 <div
 key={idx}
 className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 bg-card rounded-lg border border-zinc-200"
 >
 <Input
 type="text"
 value={item.label}
 onChange={e => updateNavItem(idx,"label", e.target.value)}
 placeholder="Label"
 className="flex-1"
 />
 <Input
 type="text"
 value={item.href}
 onChange={e => updateNavItem(idx,"href", e.target.value)}
 placeholder="/path"
 className="flex-1"
 />
 <div className="flex items-center justify-between gap-3 sm:justify-start">
 <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
 <input
 type="checkbox"
 checked={item.enabled}
 onChange={() => toggleNavItem(idx)}
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 />
 <span className={item.enabled ?"text-emerald-600" :"text-red-500"}>
 {item.enabled ?"Active" :"Disabled"}
 </span>
 </label>
 <Button
 variant="ghost"
 onClick={() => removeNavItem(idx)}
 className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 p-0"
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
 {activeTab ==="hero" && (
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>🏗️ Home Page Hero</CardTitle>
 <CardDescription>Update the welcome section content and main calls-to-action.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Badge Text</label>
 <Input
 type="text"
 value={settings.hero?.badgeText ||""}
 onChange={e => updateHero("badgeText", e.target.value)}
 placeholder="e.g. Trusted by 50,000+ IT Professionals"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Headline</label>
 <Input
 type="text"
 value={settings.hero?.headline ||""}
 onChange={e => updateHero("headline", e.target.value)}
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Sub-headline</label>
 <textarea
 value={settings.hero?.subheadline ||""}
 onChange={e => updateHero("subheadline", e.target.value)}
 rows={2}
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Primary CTA Text</label>
 <Input type="text" value={settings.hero?.ctaPrimaryText ||""} onChange={e => updateHero("ctaPrimaryText", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Primary CTA Link</label>
 <Input type="text" value={settings.hero?.ctaPrimaryHref ||""} onChange={e => updateHero("ctaPrimaryHref", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Secondary CTA Text</label>
 <Input type="text" value={settings.hero?.ctaSecondaryText ||""} onChange={e => updateHero("ctaSecondaryText", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Secondary CTA Link</label>
 <Input type="text" value={settings.hero?.ctaSecondaryHref ||""} onChange={e => updateHero("ctaSecondaryHref", e.target.value)} />
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* CONTACT & SOCIALS TAB */}
 {activeTab ==="contact" && (
 <div className="space-y-6">
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>📞 Contact Details</CardTitle>
 <CardDescription>Support channels shown on public help/contact endpoints.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Support Email</label>
 <Input type="email" value={settings.email} onChange={e => updateField("email", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Support Phone</label>
 <Input type="text" value={settings.phone} onChange={e => updateField("phone", e.target.value)} />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Office Address</label>
 <Input type="text" value={settings.address} onChange={e => updateField("address", e.target.value)} />
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>🌐 Social Media Links</CardTitle>
 <CardDescription>Public links added to footers or header icons.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {(["twitter","linkedin","youtube","facebook","github"] as const).map(s => (
 <div key={s} className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500 capitalize">{s}</label>
 <Input
 type="url"
 value={(settings.socials as any)[s] ||""}
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
 {activeTab ==="legal" && (
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>📄 Custom & Legal Pages (HTML)</CardTitle>
 <CardDescription>Configure content for legal and installation success/uninstallation pages.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {[
 { key:"privacy", label:"Privacy Policy" },
 { key:"terms", label:"Terms of Service" },
 { key:"refund", label:"Refund Policy" },
 { key:"license", label:"License Agreement" },
 { key:"thank-you-install", label:"Installation Success Page (Welcome)" },
 { key:"goodbye", label:"Uninstallation Success Page (Goodbye)" },
 ].map(page => (
 <div key={page.key} className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">{page.label}</label>
 <textarea
 value={settings.legalPages?.[page.key] ||""}
 onChange={e => updateLegalPage(page.key, e.target.value)}
 rows={6}
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 placeholder={`Enter HTML content for ${page.label}...`}
 />
 </div>
 ))}
 </CardContent>
 </Card>
 )}

 {/* ANNOUNCEMENT TAB */}
 {activeTab ==="announcement" && (
 <Card className=" border border-zinc-200 shadow-sm">
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
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 />
 <span className={settings.announcement?.enabled ?"text-emerald-600" :"text-red-500"}>
 {settings.announcement?.enabled ?"Active Banner" :"Hidden Banner"}
 </span>
 </label>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Announcement Text</label>
 <Input
 type="text"
 value={settings.announcement?.text ||""}
 onChange={e => updateAnnouncement("text", e.target.value)}
 placeholder="🎉 Summer Sale — 20% off all products!"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Link URL</label>
 <Input
 type="text"
 value={settings.announcement?.link ||""}
 onChange={e => updateAnnouncement("link", e.target.value)}
 placeholder="/products or https://..."
 />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Background Color</label>
 <div className="flex gap-2 items-center">
 <input
 type="color"
 value={settings.announcement?.bgColor ||"#6366f1"}
 onChange={e => updateAnnouncement("bgColor", e.target.value)}
 className="w-9 h-8 p-0 border-0 cursor-pointer rounded bg-muted"
 />
 <Input
 type="text"
 value={settings.announcement?.bgColor ||"#6366f1"}
 onChange={e => updateAnnouncement("bgColor", e.target.value)}
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Text Color</label>
 <div className="flex gap-2 items-center">
 <input
 type="color"
 value={settings.announcement?.textColor ||"#ffffff"}
 onChange={e => updateAnnouncement("textColor", e.target.value)}
 className="w-9 h-8 p-0 border-0 cursor-pointer rounded bg-muted"
 />
 <Input
 type="text"
 value={settings.announcement?.textColor ||"#ffffff"}
 onChange={e => updateAnnouncement("textColor", e.target.value)}
 />
 </div>
 </div>
 </div>

 {/* Live Preview */}
 {settings.announcement?.enabled && settings.announcement?.text && (
 <div
 style={{
 backgroundColor: settings.announcement.bgColor ||"#6366f1",
 color: settings.announcement.textColor ||"#ffffff"
 }}
 className="mt-4 p-3 rounded-lg text-center text-xs font-bold shadow-sm animate-fade-in"
 >
 {settings.announcement.text}
 </div>
 )}
 </CardContent>
 </Card>
 )}

  {activeTab ==="pricing" && (
  <div className="space-y-6">
  <Card>
  <CardHeader>
  <CardTitle>Feature Comparison Matrix</CardTitle>
  <CardDescription>Manage the rows shown on the pricing table.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
  <div className="space-y-3">
  {(settings.pricingComparison || []).map((row, idx) => (
  <div key={idx} className="flex gap-2 items-center bg-zinc-50 p-2 rounded-lg border border-zinc-100">
  <Input 
  className="h-8 text-xs" 
  placeholder="Feature name" 
  value={row.feature} 
  onChange={(e) => {
  const arr = [...(settings.pricingComparison || [])];
  arr[idx].feature = e.target.value;
  setSettings({ ...settings, pricingComparison: arr });
  }} 
  />
  <Input 
  className="h-8 text-xs w-28" 
  placeholder="Trial Value" 
  value={typeof row.trial === 'boolean' ? (row.trial ? 'Yes' : 'No') : row.trial} 
  onChange={(e) => {
  const arr = [...(settings.pricingComparison || [])];
  arr[idx].trial = e.target.value.toLowerCase() === 'yes' ? true : (e.target.value.toLowerCase() === 'no' ? false : e.target.value);
  setSettings({ ...settings, pricingComparison: arr });
  }} 
  />
  <Input 
  className="h-8 text-xs w-28" 
  placeholder="Standard Value" 
  value={typeof row.standard === 'boolean' ? (row.standard ? 'Yes' : 'No') : row.standard} 
  onChange={(e) => {
  const arr = [...(settings.pricingComparison || [])];
  arr[idx].standard = e.target.value.toLowerCase() === 'yes' ? true : (e.target.value.toLowerCase() === 'no' ? false : e.target.value);
  setSettings({ ...settings, pricingComparison: arr });
  }} 
  />
  <Input 
  className="h-8 text-xs w-28" 
  placeholder="Enterprise Value" 
  value={typeof row.enterprise === 'boolean' ? (row.enterprise ? 'Yes' : 'No') : row.enterprise} 
  onChange={(e) => {
  const arr = [...(settings.pricingComparison || [])];
  arr[idx].enterprise = e.target.value.toLowerCase() === 'yes' ? true : (e.target.value.toLowerCase() === 'no' ? false : e.target.value);
  setSettings({ ...settings, pricingComparison: arr });
  }} 
  />
  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 shrink-0" onClick={() => {
  const arr = [...(settings.pricingComparison || [])];
  arr.splice(idx, 1);
  setSettings({ ...settings, pricingComparison: arr });
  }}>✕</Button>
  </div>
  ))}
  </div>
  <Button type="button" variant="outline" size="sm" onClick={() => {
  setSettings({ ...settings, pricingComparison: [...(settings.pricingComparison || []), { feature:"", trial:"", standard:"", enterprise:"" }] });
  }}>+ Add Feature Row</Button>
  </CardContent>
  </Card>

  <Card>
  <CardHeader>
  <CardTitle>Pricing FAQs</CardTitle>
  <CardDescription>Questions shown at the bottom of the pricing page.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
  <div className="space-y-3">
  {(settings.pricingFaqs || []).map((faq, idx) => (
  <div key={idx} className="flex gap-2 items-start bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
  <button type="button" className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
  const arr = [...(settings.pricingFaqs || [])];
  arr.splice(idx, 1);
  setSettings({ ...settings, pricingFaqs: arr });
  }}>✕</button>
  <div className="flex-1 space-y-2">
  <Input 
  className="h-8 text-xs font-semibold" 
  placeholder="Question" 
  value={faq.question} 
  onChange={(e) => {
  const arr = [...(settings.pricingFaqs || [])];
  arr[idx].question = e.target.value;
  setSettings({ ...settings, pricingFaqs: arr });
  }} 
  />
  <textarea 
  className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25" 
  placeholder="Answer" 
  rows={2}
  value={faq.answer} 
  onChange={(e) => {
  const arr = [...(settings.pricingFaqs || [])];
  arr[idx].answer = e.target.value;
  setSettings({ ...settings, pricingFaqs: arr });
  }} 
  />
  </div>
  </div>
  ))}
  </div>
  <Button type="button" variant="outline" size="sm" onClick={() => {
  setSettings({ ...settings, pricingFaqs: [...(settings.pricingFaqs || []), { question:"", answer:"" }] });
  }}>+ Add FAQ</Button>
  </CardContent>
  </Card>
  </div>
  )}

  {activeTab === "careers" && (
    <div className="space-y-6">
      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>💼 Careers Hero Section</CardTitle>
          <CardDescription>Hero headline and intro for the /careers page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Hero Title</label>
            <Input type="text" value={settings.careersPage?.heroTitle || ""} onChange={e => updateCareers("heroTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Hero Description</label>
            <textarea
              value={settings.careersPage?.heroDescription || ""}
              onChange={e => updateCareers("heroDescription", e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>🌟 Benefits & Perks</CardTitle>
          <CardDescription>Core perks and benefits displayed on the careers page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(settings.careersPage?.benefits || []).map((benefit, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
                <button type="button" className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  const arr = [...(settings.careersPage?.benefits || [])];
                  arr.splice(idx, 1);
                  updateCareers("benefits", arr);
                }}>✕</button>
                <div className="flex gap-2">
                  <Input className="h-8 text-xs w-24" placeholder="Icon (e.g. Heart)" value={benefit.icon} onChange={(e) => {
                    const arr = [...(settings.careersPage?.benefits || [])];
                    arr[idx].icon = e.target.value;
                    updateCareers("benefits", arr);
                  }} />
                  <Input className="h-8 text-xs font-semibold flex-1" placeholder="Title (e.g. Remote Work)" value={benefit.title} onChange={(e) => {
                    const arr = [...(settings.careersPage?.benefits || [])];
                    arr[idx].title = e.target.value;
                    updateCareers("benefits", arr);
                  }} />
                </div>
                <Input className="h-8 text-xs" placeholder="Description" value={benefit.description} onChange={(e) => {
                  const arr = [...(settings.careersPage?.benefits || [])];
                  arr[idx].description = e.target.value;
                  updateCareers("benefits", arr);
                }} />
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const arr = [...(settings.careersPage?.benefits || [])];
            arr.push({ title: "New Benefit", description: "", icon: "Gift" });
            updateCareers("benefits", arr);
          }}>+ Add Benefit</Button>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>🎨 Company Culture Section</CardTitle>
          <CardDescription>Title and description for the company culture segment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Culture Section Title</label>
            <Input type="text" value={settings.careersPage?.companyCultureTitle || ""} onChange={e => updateCareers("companyCultureTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Culture Description</label>
            <textarea
              value={settings.careersPage?.companyCultureDesc || ""}
              onChange={e => updateCareers("companyCultureDesc", e.target.value)}
              rows={4}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>🎯 Open Positions</CardTitle>
          <CardDescription>Manage current job postings and details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {(settings.careersPage?.openPositions || []).map((pos, idx) => (
              <div key={pos.id || idx} className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 relative group space-y-3">
                <button type="button" className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  const arr = [...(settings.careersPage?.openPositions || [])];
                  arr.splice(idx, 1);
                  updateCareers("openPositions", arr);
                }}>✕</button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Job Title</label>
                    <Input className="h-8 text-xs font-semibold" placeholder="e.g. Senior Backend Engineer" value={pos.title} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].title = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Department</label>
                    <Input className="h-8 text-xs" placeholder="e.g. Engineering" value={pos.department} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].department = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Location</label>
                    <Input className="h-8 text-xs" placeholder="e.g. Remote, US" value={pos.location} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].location = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Job Type</label>
                    <Input className="h-8 text-xs" placeholder="e.g. Full-Time" value={pos.type} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].type = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Experience</label>
                    <Input className="h-8 text-xs" placeholder="e.g. Mid-Senior" value={pos.experience} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].experience = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-500">Salary Range</label>
                    <Input className="h-8 text-xs" placeholder="e.g. $100k - $130k" value={pos.salaryRange} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].salaryRange = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-500">Short Description</label>
                    <Input className="h-8 text-xs" placeholder="Short summary of the role..." value={pos.description} onChange={(e) => {
                      const arr = [...(settings.careersPage?.openPositions || [])];
                      arr[idx].description = e.target.value;
                      updateCareers("openPositions", arr);
                    }} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-500">Requirements & Details (Bullet points/Text)</label>
                    <textarea
                      rows={4}
                      value={pos.requirements}
                      placeholder="Bullet list of requirements..."
                      onChange={(e) => {
                        const arr = [...(settings.careersPage?.openPositions || [])];
                        arr[idx].requirements = e.target.value;
                        updateCareers("openPositions", arr);
                      }}
                      className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={pos.active}
                      onChange={(e) => {
                        const arr = [...(settings.careersPage?.openPositions || [])];
                        arr[idx].active = e.target.checked;
                        updateCareers("openPositions", arr);
                      }}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-zinc-700">Role Active / Accepting Applications</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const arr = [...(settings.careersPage?.openPositions || [])];
            arr.push({
              id: "job-" + Date.now(),
              title: "New Role",
              department: "",
              location: "Remote",
              type: "Full-Time",
              experience: "",
              salaryRange: "",
              description: "",
              requirements: "",
              active: true
            });
            updateCareers("openPositions", arr);
          }}>+ Add Position</Button>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>🔍 SEO Configuration</CardTitle>
          <CardDescription>Configure search engine metadata for the careers page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Title</label>
            <Input type="text" value={settings.careersPage?.metaTitle || ""} onChange={e => updateCareers("metaTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Description</label>
            <textarea
              value={settings.careersPage?.metaDescription || ""}
              onChange={e => updateCareers("metaDescription", e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Keywords</label>
            <Input type="text" value={settings.careersPage?.metaKeywords || ""} onChange={e => updateCareers("metaKeywords", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )}

  {/* OUR CLIENTS TAB */}
  {activeTab === "clients" && (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>👥 Clients Page Configuration</CardTitle>
          <CardDescription>Configure the landing section for your list of clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Hero Section Title</label>
            <Input type="text" value={settings.clientsPage?.heroTitle || ""} onChange={e => updateClients("heroTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Hero Subtitle</label>
            <textarea
              value={settings.clientsPage?.heroSubtitle || ""}
              onChange={e => updateClients("heroSubtitle", e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>📈 Stats & Metrics</CardTitle>
          <CardDescription>Configure the stats grid metrics shown on the Clients page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {(settings.clientsPage?.stats || []).map((stat, idx) => {
              const arr = [...(settings.clientsPage?.stats || [])];
              return (
                <div key={idx} className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Value (e.g., 150+)</label>
                    <Input
                      type="text"
                      value={stat.value || ""}
                      onChange={e => {
                        arr[idx] = { ...stat, value: e.target.value };
                        updateClients("stats", arr);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Label (e.g., Companies Trust Us)</label>
                    <Input
                      type="text"
                      value={stat.label || ""}
                      onChange={e => {
                        arr[idx] = { ...stat, label: e.target.value };
                        updateClients("stats", arr);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-5"
                    onClick={() => {
                      arr.splice(idx, 1);
                      updateClients("stats", arr);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const arr = [...(settings.clientsPage?.stats || [])];
                arr.push({ value: "", label: "" });
                updateClients("stats", arr);
              }}
            >
              + Add Stat Metric
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>📢 Call to Action Section</CardTitle>
          <CardDescription>Configure the conversion section at the bottom of the Clients page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">CTA Title</label>
            <Input type="text" value={settings.clientsPage?.ctaTitle || ""} onChange={e => updateClients("ctaTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">CTA Text</label>
            <textarea
              value={settings.clientsPage?.ctaText || ""}
              onChange={e => updateClients("ctaText", e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">CTA Button Text</label>
              <Input type="text" value={settings.clientsPage?.ctaButtonText || ""} onChange={e => updateClients("ctaButtonText", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">CTA Button Link</label>
              <Input type="text" value={settings.clientsPage?.ctaButtonLink || ""} onChange={e => updateClients("ctaButtonLink", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>🔍 SEO Configuration</CardTitle>
          <CardDescription>Configure search engine metadata for the clients page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Title</label>
            <Input type="text" value={settings.clientsPage?.metaTitle || ""} onChange={e => updateClients("metaTitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Description</label>
            <textarea
              value={settings.clientsPage?.metaDescription || ""}
              onChange={e => updateClients("metaDescription", e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Meta Keywords</label>
            <Input type="text" value={settings.clientsPage?.metaKeywords || ""} onChange={e => updateClients("metaKeywords", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )}

 {/* ABOUT PAGE TAB */}
 {activeTab ==="about" && (
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>👥 About Page Config</CardTitle>
 <CardDescription>Configure layouts and dynamic listings for /about.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Hero Title</label>
 <Input type="text" value={settings.aboutPage?.heroTitle ||""} onChange={e => updateAbout("heroTitle", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Hero Description</label>
 <textarea
 value={settings.aboutPage?.heroDescription ||""}
 onChange={e => updateAbout("heroDescription", e.target.value)}
 rows={2}
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Mission Title</label>
 <Input type="text" value={settings.aboutPage?.missionTitle ||""} onChange={e => updateAbout("missionTitle", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Mission Content (HTML)</label>
 <textarea
 value={settings.aboutPage?.missionContent ||""}
 onChange={e => updateAbout("missionContent", e.target.value)}
 rows={5}
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 <div className="flex gap-6 pt-2">
 <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
 <input
 type="checkbox"
 checked={settings.aboutPage?.showTeam !== false}
 onChange={e => updateAbout("showTeam", e.target.checked)}
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 />
 <span>Show Team Section</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
 <input
 type="checkbox"
 checked={settings.aboutPage?.showStats !== false}
 onChange={e => updateAbout("showStats", e.target.checked)}
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 />
 <span>Show Stats Section</span>
 </label>
 </div>
 </CardContent>
 </Card>
 )}
  {activeTab ==="trust" && (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>🏆 Company Stats</CardTitle>
 <CardDescription>Key metrics displayed on the About page.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-3">
 {(settings.stats || []).map((stat, idx) => (
 <div key={idx} className="flex gap-2 items-start bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
 <button type="button" className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
 const arr = [...(settings.stats || [])];
 arr.splice(idx, 1);
 setSettings({ ...settings, stats: arr });
 }}>✕</button>
 <div className="flex-1 flex gap-2">
 <Input className="h-8 text-xs font-semibold w-1/3" placeholder="Value (e.g. 1M+)" value={stat.value} onChange={(e) => {
 const arr = [...(settings.stats || [])];
 arr[idx].value = e.target.value;
 setSettings({ ...settings, stats: arr });
 }} />
 <Input className="h-8 text-xs w-2/3" placeholder="Label (e.g. Downloads)" value={stat.label} onChange={(e) => {
 const arr = [...(settings.stats || [])];
 arr[idx].label = e.target.value;
 setSettings({ ...settings, stats: arr });
 }} />
 </div>
 </div>
 ))}
 </div>
 <Button type="button" variant="outline" size="sm" onClick={() => setSettings({ ...settings, stats: [...(settings.stats || []), { value: "", label: "" }] })}>+ Add Stat</Button>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>🏅 Trust Badges</CardTitle>
 <CardDescription>Badges displayed on the Security and Home pages to build trust.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-3">
 {(settings.trustBadges || []).map((badge, idx) => (
 <div key={idx} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
 <button type="button" className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
 const arr = [...(settings.trustBadges || [])];
 arr.splice(idx, 1);
 setSettings({ ...settings, trustBadges: arr });
 }}>✕</button>
 <div className="flex gap-2">
 <Input className="h-8 text-xs w-12 text-center" placeholder="Emoji" value={badge.emoji} onChange={(e) => {
 const arr = [...(settings.trustBadges || [])];
 arr[idx].emoji = e.target.value;
 setSettings({ ...settings, trustBadges: arr });
 }} />
 <Input className="h-8 text-xs font-semibold flex-1" placeholder="Title (e.g. 256-bit SSL)" value={badge.title} onChange={(e) => {
 const arr = [...(settings.trustBadges || [])];
 arr[idx].title = e.target.value;
 setSettings({ ...settings, trustBadges: arr });
 }} />
 </div>
 <Input className="h-8 text-xs" placeholder="Description" value={badge.desc} onChange={(e) => {
 const arr = [...(settings.trustBadges || [])];
 arr[idx].desc = e.target.value;
 setSettings({ ...settings, trustBadges: arr });
 }} />
 </div>
 ))}
 </div>
 <Button type="button" variant="outline" size="sm" onClick={() => setSettings({ ...settings, trustBadges: [...(settings.trustBadges || []), { emoji: "🛡️", title: "", desc: "", color: "text-blue-600 bg-blue-50" }] })}>+ Add Badge</Button>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>👨‍💼 Team Members</CardTitle>
 <CardDescription>Key leadership displayed on the About page.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-3">
 {(settings.teamMembers || []).map((member, idx) => (
 <div key={idx} className="flex flex-col gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
 <button type="button" className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
 const arr = [...(settings.teamMembers || [])];
 arr.splice(idx, 1);
 setSettings({ ...settings, teamMembers: arr });
 }}>✕</button>
 <div className="flex gap-2">
 <Input className="h-8 text-xs font-semibold flex-1" placeholder="Name" value={member.name} onChange={(e) => {
 const arr = [...(settings.teamMembers || [])];
 arr[idx].name = e.target.value;
 setSettings({ ...settings, teamMembers: arr });
 }} />
 <Input className="h-8 text-xs flex-1" placeholder="Role (e.g. CEO)" value={member.role} onChange={(e) => {
 const arr = [...(settings.teamMembers || [])];
 arr[idx].role = e.target.value;
 setSettings({ ...settings, teamMembers: arr });
 }} />
 <Input className="h-8 text-xs w-16" placeholder="Initials" value={member.initials} onChange={(e) => {
 const arr = [...(settings.teamMembers || [])];
 arr[idx].initials = e.target.value;
 setSettings({ ...settings, teamMembers: arr });
 }} />
 </div>
 <textarea className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25" placeholder="Short bio..." rows={2} value={member.bio} onChange={(e) => {
 const arr = [...(settings.teamMembers || [])];
 arr[idx].bio = e.target.value;
 setSettings({ ...settings, teamMembers: arr });
 }} />
 </div>
 ))}
 </div>
 <Button type="button" variant="outline" size="sm" onClick={() => setSettings({ ...settings, teamMembers: [...(settings.teamMembers || []), { name: "", role: "", bio: "", initials: "" }] })}>+ Add Team Member</Button>
 </CardContent>
 </Card>
 </div>
 )}
  </main>

  {/* Unsaved Changes Floating Banner */}
  {isDirty && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-full border border-amber-500/20 bg-zinc-950/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in ring-1 ring-amber-500/30">
      <span className="flex items-center gap-1.5 text-amber-400">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        Unsaved Changes
      </span>
      <div className="w-[1px] h-4 bg-zinc-800" />
      <span className="text-zinc-400">You have unsaved edits in this brand settings.</span>
      <Button
        onClick={() => handleSave()}
        disabled={saving}
        size="sm"
        className="h-7 px-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-bold rounded-full transition-all text-[11px] shadow-lg shadow-amber-500/20 cursor-pointer"
      >
        {saving ? "Saving..." : "Save Now"}
      </Button>
    </div>
  )}
  </div>
 );
}
