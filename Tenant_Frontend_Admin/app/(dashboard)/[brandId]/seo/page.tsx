"use client";

import { useEffect, useState, FormEvent } from"react";
import { useParams } from"next/navigation";
import { useTheme } from"@/app/(dashboard)/layout";
import { AdminProductAPI, AdminBlogAPI, AdminSettingsAPI } from "@/services/api";
import { Product } from "@/types/product";
import { AuthService } from "@/services/auth";
import { BlogPost } from"@/types/blog";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Input } from"@/components/ui/Input";
import { Select } from"@/components/ui/Select";
import { cn } from"@/lib/utils";

interface SeoField {
 metaTitle?: string;
 metaDescription?: string;
 keywords?: string[];
 canonicalUrl?: string;
 ogTitle?: string;
 ogDescription?: string;
 ogImage?: string;
}

interface SeoItem {
 id: string;
 name: string;
 slug: string;
 type:"product" |"blog";
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
}

export default function SeoAndSettingsPage() {
 const params = useParams();
 const brandId = (params?.brandId as string) ||"";
 const { theme, toggleTheme } = useTheme();

 // Tab State
 const [activeTab, setActiveTab] = useState<"seo" |"settings">("seo");

 // SEO State
 const [items, setItems] = useState<SeoItem[]>([]);
 const [seoLoading, setSeoLoading] = useState(true);
 const [filter, setFilter] = useState<"all" |"product" |"blog">("all");
 const [search, setSearch] = useState("");
 const [editing, setEditing] = useState<SeoItem | null>(null);
 const [seoForm, setSeoForm] = useState<SeoField>({});
 const [seoSaving, setSeoSaving] = useState(false);
 const [seoToast, setSeoToast] = useState<{ msg: string; type:"success" |"error" } | null>(null);

 // Settings State
 const [settings, setSettings] = useState<SiteSettings | null>(null);
 const [settingsLoading, setSettingsLoading] = useState(true);
 const [settingsSaving, setSettingsSaving] = useState(false);
 const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
 const [settingsError, setSettingsError] = useState<string | null>(null);

 const [userRole, setUserRole] = useState<string>("");

 useEffect(() => {
   const session = AuthService.getSession();
   if (session) {
     setUserRole(session.role);
   }
 }, []);

 // Load SEO
 useEffect(() => {
 if (activeTab ==="seo") {
 loadSeo();
 } else {
 loadSettings();
 }
 }, [activeTab, brandId]);

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
 type:"product",
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
 type:"blog",
 seo: b.seo ? {
 metaTitle: b.seo.title,
 metaDescription: b.seo.description,
 keywords: b.seo.keywords,
 } : undefined,
 }));

 setItems([...productItems, ...blogItems]);
 } catch {
 showSeoToast("Failed to load content","error");
 } finally {
 setSeoLoading(false);
 }
 }

 function showSeoToast(msg: string, type:"success" |"error") {
 setSeoToast({ msg, type });
 setTimeout(() => setSeoToast(null), 4000);
 }

 async function loadSettings() {
 try {
 setSettingsLoading(true);
 const data = await AdminSettingsAPI.get();
 
 const formattedData: SiteSettings = {
 id: data.id ||"",
 siteId: data.siteId || brandId,
 name: data.name ||"",
 tagline: data.tagline ||"",
 description: data.description ||"",
 url: data.url ||"",
 email: data.email ||"",
 phone: data.phone ||"",
 address: data.address ||"",
 socials: {
 twitter: data.socials?.twitter ||"",
 linkedin: data.socials?.linkedin ||"",
 youtube: data.socials?.youtube ||"",
 facebook: data.socials?.facebook ||"",
 github: data.socials?.github ||"",
 },
 stats: data.stats || [
 { value:"1M+", label:"Downloads" },
 { value:"50K+", label:"Happy Users" },
 { value:"4.9★", label:"Avg Rating" },
 { value:"99.9%", label:"Success Rate" }
 ]
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
 setSettingsSuccess("Storefront configurations saved successfully!");
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

 function handleSocialChange(field: keyof Socials, value: string) {
 if (!settings) return;
 setSettings({
 ...settings,
 socials: { ...settings.socials, [field]: value }
 });
 }

 function handleStatChange(index: number, key:"value" |"label", val: string) {
 if (!settings) return;
 const newStats = [...settings.stats];
 newStats[index] = { ...newStats[index], [key]: val };
 setSettings({ ...settings, stats: newStats });
 }

 function openSeoEditor(item: SeoItem) {
 setEditing(item);
 setSeoForm({
 metaTitle: item.seo?.metaTitle ||"",
 metaDescription: item.seo?.metaDescription ||"",
 keywords: item.seo?.keywords || [],
 canonicalUrl: item.seo?.canonicalUrl ||"",
 ogTitle: item.seo?.ogTitle ||"",
 ogDescription: item.seo?.ogDescription ||"",
 ogImage: item.seo?.ogImage ||"",
 });
 }

 async function saveSeo(isDraftOnly: boolean = false) {
 if (!editing) return;
 try {
 setSeoSaving(true);
 const keywords = typeof seoForm.keywords ==="string"
 ? (seoForm.keywords as string).split(",").map((k) => k.trim()).filter(Boolean)
 : (seoForm.keywords || []);

 const apiSeo = {
 title: seoForm.metaTitle ||"",
 description: seoForm.metaDescription ||"",
 keywords: keywords
 };

 const localSeo = { ...seoForm, keywords: keywords };

 if (editing.type ==="product") {
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
 showSeoToast(isDraftOnly ?"Draft progress saved successfully!" :"SEO settings saved successfully!","success");
 if (!isDraftOnly) {
 setEditing(null);
 }
 } catch {
 showSeoToast("Failed to save SEO settings","error");
 } finally {
 setSeoSaving(false);
 }
 }

 const filteredSeo = items.filter((item) => {
 if (filter !=="all" && item.type !== filter) return false;
 if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
 return true;
 });

 const seoScore = (item: SeoItem) => {
 const s = item.seo;
 if (!s) return 0;
 let score = 0;
 if (s.metaTitle) score += 25;
 if (s.metaDescription) score += 25;
 if (s.keywords && s.keywords.length > 0) score += 20;
 if (s.ogTitle) score += 15;
 if (s.ogImage) score += 15;
 return score;
 };

 const scoreColor = (score: number) => {
 if (score >= 80) return"#10b981";
 if (score >= 50) return"#f59e0b";
 return"#ef4444";
 };

 const titleLen = (seoForm.metaTitle ||"").length;
 const isTitleValid = titleLen >= 30 && titleLen <= 60;
 
 const descLen = (seoForm.metaDescription ||"").length;
 const isDescValid = descLen >= 120 && descLen <= 160;
 
 const keywordsCount = Array.isArray(seoForm.keywords) 
 ? seoForm.keywords.length 
 : (typeof seoForm.keywords ==="string" ? (seoForm.keywords as string).split(",").filter(Boolean).length : 0);
 const isKeywordsValid = keywordsCount > 0;
 
 const isCanonicalValid = seoForm.canonicalUrl ? /^https?:\/\/[^\s$.?#].[^\s]*$/.test(seoForm.canonicalUrl) : false;
 
 const isOgTitleValid = !!(seoForm.ogTitle ||"").trim();
 const isOgDescValid = !!(seoForm.ogDescription ||"").trim();
 const isOgImageValid = !!(seoForm.ogImage ||"").trim();

 let checksPassed = 0;
 if (isTitleValid) checksPassed++;
 if (isDescValid) checksPassed++;
 if (isKeywordsValid) checksPassed++;
 if (isCanonicalValid) checksPassed++;
 if (isOgTitleValid) checksPassed++;
 if (isOgDescValid) checksPassed++;
 if (isOgImageValid) checksPassed++;
 
 const liveScore = Math.round((checksPassed / 7) * 100);

 const keywordsStr = Array.isArray(seoForm.keywords) ? seoForm.keywords.join(",") :"";
 const isDark = theme ==="dark";

 return (
 <div className="space-y-6 max-w-6xl mx-auto">
 {seoToast && (
 <div className={cn(
"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold shadow-lg backdrop-blur-md animate-fade-in",
 seoToast.type ==="success" ?"border-emerald-500/20 bg-emerald-500/10 text-emerald-600" :"border-red-500/20 bg-red-500/10 text-red-600"
 )}>
 <span>{seoToast.type ==="success" ?"✅" :"❌"}</span>
 <span>{seoToast.msg}</span>
 </div>
 )}

 {/* Header and Switcher tabs */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5 gap-4">
 <div className="space-y-1">
 <h1 className="text-xl font-bold tracking-tight text-zinc-900">SEO & Settings</h1>
 <p className="text-xs text-zinc-500 font-medium">
 Optimize search indexing and details under brand scope:{""}
 <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
 {brandId}
 </span>
 </p>
 </div>
 
 <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-zinc-200 shrink-0 select-none">
 <button 
 className={cn(
"px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
 activeTab ==="seo"
 ?"bg-white shadow-sm text-zinc-900"
 :"text-zinc-500 hover:text-zinc-900"
 )} 
 onClick={() => setActiveTab("seo")}
 >
 🔍 SEO Optimizer
 </button>
 {(userRole !== "SEO" && userRole !== "SEO_CW_PRODUCT_MANAGER") && (
 <button 
 className={cn(
"px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
 activeTab ==="settings"
 ?"bg-white shadow-sm text-zinc-900"
 :"text-zinc-500 hover:text-zinc-900"
 )} 
 onClick={() => setActiveTab("settings")}
 >
 🏠 Brand Configurations
 </button>
 )}
 </div>
 </div>

 {/* SEO Tab Content */}
 {activeTab ==="seo" && (
 <div className="space-y-6">
 {editing && (
 <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
 {/* Header Bar */}
 <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 shrink-0">
 <div className="flex items-center gap-4">
 <span 
 className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 transition-colors select-none" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setEditing(null);
 }
 }} 
 title="Exit Workspace"
 >
 ←
 </span>
 <h2 className="text-lg font-bold text-zinc-900">
 Editing SEO: {editing.name}
 </h2>
 <span className={cn(
"text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
 editing.type ==="product" 
 ?"bg-indigo-500/10 border-indigo-500/20 text-indigo-600" 
 :"bg-purple-500/10 border-purple-500/20 text-purple-600"
 )}>
 {editing.type}
 </span>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 mr-3 select-none">
 <span className="text-xs font-semibold text-zinc-500">Live SEO Score:</span>
 <span 
 style={{ color: scoreColor(liveScore), backgroundColor: scoreColor(liveScore) +"1a", borderColor: scoreColor(liveScore) +"26" }}
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
 className="text-zinc-400 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
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
 <aside className="w-80 bg-card border-r border-zinc-200 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
 <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">SEO Audit Checklist</h3>
 <div className="space-y-3 flex-1">
 {[
 { passed: isTitleValid, title:"Meta Title Length", desc:`Title is ${titleLen} chars (Goal: 30-60)` },
 { passed: isDescValid, title:"Meta Description Length", desc:`Desc is ${descLen} chars (Goal: 120-160)` },
 { passed: isKeywordsValid, title:"Keywords Count", desc:`${keywordsCount} keywords added (Goal: >= 1)` },
 { passed: isCanonicalValid, title:"Canonical URL Format", desc: seoForm.canonicalUrl ? (isCanonicalValid ?"Valid format" :"Invalid format") :"Missing canonical URL" },
 { passed: isOgTitleValid, title:"Open Graph Title", desc: isOgTitleValid ?"OG Title is set" :"OG Title is missing" },
 { passed: isOgDescValid, title:"Open Graph Description", desc: isOgDescValid ?"OG Desc is set" :"OG Desc is missing" },
 { passed: isOgImageValid, title:"Open Graph Image", desc: isOgImageValid ?"OG Image URL is set" :"OG Image URL is missing" }
 ].map((check, idx) => (
 <div 
 key={idx} 
 className={cn(
"flex gap-3 p-3 rounded-lg border text-xs items-start",
 check.passed 
 ?"border-emerald-500/20 bg-emerald-500/5 text-zinc-800" 
 :"border-amber-500/20 bg-amber-500/5 text-zinc-800"
 )}
 >
 <span className="text-sm shrink-0">{check.passed ?"✅" :"⚠️"}</span>
 <div className="space-y-0.5">
 <span className="font-semibold block">{check.title}</span>
 <span className="text-[10px] text-zinc-400 block">{check.desc}</span>
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-zinc-200 pt-4 space-y-2">
 <div className="flex justify-between text-xs font-bold text-zinc-900">
 <span>Completion Score</span>
 <span>{liveScore}%</span>
 </div>
 <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
 <div 
 style={{ width:`${liveScore}%`, backgroundColor: scoreColor(liveScore) }} 
 className="h-full rounded-full transition-all duration-300"
 />
 </div>
 </div>
 </aside>

 {/* Right Editing Canvas */}
 <main className="flex-1 p-8 overflow-y-auto bg-white">
 <div className="max-w-3xl mx-auto space-y-6">
 <Card className=" border border-zinc-200 p-6">
 <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-6">
 <CardTitle className="text-sm font-bold">🔍 Basic SEO Metadata</CardTitle>
 </CardHeader>
 <CardContent className="px-0 pb-0 space-y-4">
 <div className="space-y-1.5">
 <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
 <span>Meta Title</span>
 <span style={{ color: isTitleValid ?"#10b981" :"#f59e0b" }} className="font-mono">{titleLen}/60</span>
 </div>
 <Input
 type="text"
 value={seoForm.metaTitle ||""}
 onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
 placeholder="Recommended: 30-60 characters"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Canonical URL</label>
 <Input
 type="url"
 value={seoForm.canonicalUrl ||""}
 onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
 placeholder="e.g. https://www.example.com/products/example-slug"
 />
 </div>

 <div className="space-y-1.5">
 <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
 <span>Meta Description</span>
 <span style={{ color: isDescValid ?"#10b981" :"#f59e0b" }} className="font-mono">{descLen}/160</span>
 </div>
 <textarea
 value={seoForm.metaDescription ||""}
 onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
 rows={3}
 placeholder="Recommended: 120-160 characters"
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Keywords (comma-separated)</label>
 <Input
 type="text"
 value={keywordsStr}
 onChange={(e) =>
 setSeoForm({ ...seoForm, keywords: e.target.value.split(",").map((k) => k.trim()) })
 }
 placeholder="e.g. key term 1, key term 2"
 />
 </div>
 </CardContent>
 </Card>

 <Card className=" border border-zinc-200 p-6">
 <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-6">
 <CardTitle className="text-sm font-bold">🌐 Open Graph (Social Sharing)</CardTitle>
 </CardHeader>
 <CardContent className="px-0 pb-0 space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">OG Title</label>
 <Input
 type="text"
 value={seoForm.ogTitle ||""}
 onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
 placeholder="Leave blank to fallback to Meta Title"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">OG Description</label>
 <textarea
 value={seoForm.ogDescription ||""}
 onChange={(e) => setSeoForm({ ...seoForm, ogDescription: e.target.value })}
 rows={2}
 placeholder="Leave blank to fallback to Meta Description"
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">OG Image URL</label>
 <Input
 type="text"
 value={seoForm.ogImage ||""}
 onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
 placeholder="e.g. https://www.example.com/images/og.png"
 />
 </div>
 </CardContent>
 </Card>
 </div>
 </main>
 </div>
 </div>
 )}

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 mb-4">
 <div className="flex gap-1 bg-muted p-1 rounded-lg border border-zinc-200 shrink-0 select-none">
 {(["all","product","blog"] as const).map((f) => (
 <button
 key={f}
 className={cn(
"px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 bg-transparent",
 filter === f
 ?"bg-white shadow-sm text-zinc-900"
 :"text-zinc-400 hover:text-zinc-900"
 )}
 onClick={() => setFilter(f)}
 >
 {f ==="all" ?"All" : f ==="product" ?"Products" :"Blogs"}
 </button>
 ))}
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
 <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
 <span className="text-xs font-semibold">Loading SEO indices...</span>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredSeo.map((item) => {
 const score = seoScore(item);
 const color = scoreColor(score);
 return (
 <Card key={`${item.type}-${item.id}`} className=" border border-zinc-200 shadow-sm flex flex-col justify-between">
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <span className={cn(
"text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
 item.type ==="product" 
 ?"bg-indigo-500/10 border-indigo-500/20 text-indigo-600" 
 :"bg-purple-500/10 border-purple-500/20 text-purple-600"
 )}>
 {item.type}
 </span>
 <span 
 style={{ color, backgroundColor: color +"1a", borderColor: color +"26" }}
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
 <span className={cn("truncate text-right", !item.seo?.metaTitle &&"text-amber-500")}>
 {item.seo?.metaTitle ||"⚠️ Not set"}
 </span>
 </div>
 <div className="flex justify-between gap-2">
 <span className="font-semibold text-zinc-400 shrink-0">Desc:</span>
 <span className={cn("truncate text-right", !item.seo?.metaDescription &&"text-amber-500")}>
 {item.seo?.metaDescription ||"⚠️ Not set"}
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

 {/* Settings Tab Content */}
 {activeTab ==="settings" && (userRole !== "SEO" && userRole !== "SEO_CW_PRODUCT_MANAGER") && (
 <div className="space-y-6">
 {settingsLoading ? (
 <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
 <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
 <span className="text-xs font-semibold">Loading storefront configurations...</span>
 </div>
 ) : settings ? (
 <form onSubmit={handleSaveSettings} className="space-y-6">
 {settingsSuccess && (
 <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-600">
 {settingsSuccess}
 </div>
 )}
 {settingsError && (
 <div className="p-3.5 rounded-lg border border-red-205 bg-red-50/50 text-xs font-semibold text-red-600">
 {settingsError}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>🏠 Brand Details</CardTitle>
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
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 </CardContent>
 </Card>

 <Card className=" border border-zinc-200 shadow-sm">
 <CardHeader>
 <CardTitle>📞 Contact Channels</CardTitle>
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

 <div className="flex justify-end pt-4 border-t border-zinc-200">
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
