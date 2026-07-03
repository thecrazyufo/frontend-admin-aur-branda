"use client";

import { useEffect, useState, FormEvent } from"react";
import { useParams } from"next/navigation";
import { 
 AdminProductAPI, 
 AdminBlogAPI, 
 AdminFaqAPI, 
 AdminCategoryAPI,
 AdminSettingsAPI,
 API_BASE
} from"@/services/api";
import { Product } from"@/types/product";
import { BlogPost } from"@/types/blog";
import { FAQ } from"@/types/faq";
import { Category } from"@/services/api";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from"@/components/ui/Table";
import { Input } from"@/components/ui/Input";
import { Select } from"@/components/ui/Select";
import { MarkdownEditor } from"@/components/ui/MarkdownEditor";
import { cn } from"@/lib/utils";

type Tab ="products" |"blogs" |"faqs" |"categories";

const emptyProduct = (): Partial<Product> => ({
 name:"",
 slug:"",
 price: 0,
 category:"email-migration",
 description:"",
 shortDescription:"",
 version:"1.0.0",
 badge: undefined,
 trialDownloadUrl:"",
 features: [],
 platforms: ["Windows"],
 supportedFormats: [],
 pricing: [
 { name:"Standard License", price: 49.00, period:"lifetime", features: ["1 Mailbox migration","Free 1-year updates","24/7 technical support"], cta:"" }
 ],
 systemRequirements: { os:"Windows 11/10/8/7 (32/64 bit)", processor:"1 GHz Intel/AMD processor", ram:"2 GB", disk:"100 MB" },
 howItWorks: [
 { step: 1, title:"Download & Install", description:"Download the software and install it on your PC." },
 { step: 2, title:"Add PST File", description:"Launch the software and select the Outlook PST file you want to convert." },
 { step: 3, title:"Select Output", description:"Choose the output format and destination path." },
 { step: 4, title:"Convert & Export", description:"Click Convert to export your mailbox items." }
 ],
 faqs: [
 { question:"Can I convert large PST files?", answer:"Yes, our software has no file size limit and can convert large PST files without data loss." }
 ],
 screenshots: [],
 reviews: [
 { id:"rev-1", author:"John D.", rating: 5, date: new Date().toISOString().split('T')[0], content:"Excellent converter, saved me hours of work!", role:"System Administrator", company:"Tech Solutions" }
 ],
 relatedProductIds: [],
 seo: {
 title:"",
 description:"",
 keywords: []
 },
 enabled: true
});


export default function ContentCreatorPage() {
 const params = useParams();
 const brandId = (params?.brandId as string) ||"";

 const [activeTab, setActiveTab] = useState<Tab>("products");
 const [loading, setLoading] = useState(true);
 const [toast, setToast] = useState<{ msg: string; type:"success" |"error" } | null>(null);

 // Lists
 const [products, setProducts] = useState<Product[]>([]);
 const [blogs, setBlogs] = useState<BlogPost[]>([]);
 const [faqs, setFaqs] = useState<FAQ[]>([]);
 const [categories, setCategories] = useState<Category[]>([]);

 // Search
 const [search, setSearch] = useState("");

 // Modals state
 const [productModal, setProductModal] = useState<Partial<Product> | null>(null);
 const [modalSubTab, setModalSubTab] = useState<"basic" |"tech" |"pricing" |"comparison" |"requirements" |"howItWorks" |"faqs" |"screenshots" |"reviews" |"seo" |"api">("basic");
 const [siteUrl, setSiteUrl] = useState("https://www.pstconverter.com");
 const [quickLinksModal, setQuickLinksModal] = useState<Product | null>(null);
 const [copiedLink, setCopiedLink] = useState<string | null>(null);
 const [blogModal, setBlogModal] = useState<Partial<BlogPost> | null>(null);
 const [faqModal, setFaqModal] = useState<Partial<FAQ> | null>(null);
 const [categoryModal, setCategoryModal] = useState<Partial<Category> | null>(null);
 const [saving, setSaving] = useState(false);

 // Dynamic inline category states
 const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
 const [newCategoryForm, setNewCategoryForm] = useState({ label:"", description:"", icon:"database", color:"#6366f1" });
 const [newCategorySaving, setNewCategorySaving] = useState(false);

 async function handleCreateCategoryInline() {
 if (!newCategoryForm.label.trim()) {
 alert("Category label is required");
 return;
 }
 try {
 setNewCategorySaving(true);
 const categoryId = newCategoryForm.label.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-");
 const payload = {
 id: categoryId,
 label: newCategoryForm.label,
 description: newCategoryForm.description,
 icon: newCategoryForm.icon,
 color: newCategoryForm.color,
 siteId: brandId
 };
 
 const savedCat = await AdminCategoryAPI.create(payload);
 
 // Update dynamic states:
 setCategories(prev => [...prev, savedCat]);
 
 // Auto-assign to product
 if (productModal) {
 setProductModal({ ...productModal, category: savedCat.id });
 }

 showToast("New category added and assigned!","success");
 setNewCategoryForm({ label:"", description:"", icon:"database", color:"#6366f1" });
 setShowInlineCategoryForm(false);
 } catch {
 showToast("Failed to create inline category","error");
 } finally {
 setNewCategorySaving(false);
 }
 }

 useEffect(() => {
 loadData();
 }, [brandId]);

 async function loadData() {
 try {
 setLoading(true);
 const [ps, bs, fs, cs, settings] = await Promise.all([
 AdminProductAPI.getAll(),
 AdminBlogAPI.getAll(),
 AdminFaqAPI.getAll(),
 AdminCategoryAPI.getAll(),
 AdminSettingsAPI.get().catch(() => null)
 ]);
 setProducts(ps.filter(x => x.siteId === brandId));
 setBlogs(bs.filter(x => x.siteId === brandId));
 setFaqs(fs.filter(x => x.siteId === brandId));
 setCategories(cs.filter(x => x.siteId === brandId));
 if (settings && settings.url) {
 setSiteUrl(settings.url);
 }
 } catch {
 showToast("Failed to load storefront contents","error");
 } finally {
 setLoading(false);
 }
 }

 function showToast(msg: string, type:"success" |"error") {
 setToast({ msg, type });
 setTimeout(() => setToast(null), 3500);
 }

 // Delete Handlers
 async function handleDeleteProduct(id: string, name: string) {
 if (!confirm(`Delete product"${name}"?`)) return;
 try {
 await AdminProductAPI.delete(id);
 setProducts(prev => prev.filter(x => x.id !== id));
 showToast("Product deleted successfully","success");
 } catch {
 showToast("Failed to delete product","error");
 }
 }

 async function handleDeleteBlog(id: string, title: string) {
 if (!confirm(`Delete blog post"${title}"?`)) return;
 try {
 await AdminBlogAPI.delete(id);
 setBlogs(prev => prev.filter(x => x.id !== id));
 showToast("Blog post deleted successfully","success");
 } catch {
 showToast("Failed to delete blog post","error");
 }
 }

 async function handleDeleteFaq(id: string) {
 if (!confirm(`Delete this FAQ?`)) return;
 try {
 await AdminFaqAPI.delete(id);
 setFaqs(prev => prev.filter(x => x.id !== id));
 showToast("FAQ deleted successfully","success");
 } catch {
 showToast("Failed to delete FAQ","error");
 }
 }

 async function handleDeleteCategory(id: string, label: string) {
 if (!confirm(`Delete category"${label}"?`)) return;
 try {
 await AdminCategoryAPI.delete(id);
 setCategories(prev => prev.filter(x => x.id !== id));
 showToast("Category deleted successfully","success");
 } catch {
 showToast("Failed to delete category","error");
 }
 }

 // Save Handlers
 async function handleSaveProduct(e: FormEvent) {
 e.preventDefault();
 await saveProduct(false);
 }

 async function saveProduct(isDraftOnly: boolean) {
 if (!productModal) return;
 try {
 setSaving(true);
 const payload = { 
 ...productModal, 
 siteId: brandId,
 enabled: productModal.enabled !== false
 };
 let saved: Product;
 if (productModal.id) {
 saved = await AdminProductAPI.update(productModal.id, payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Product updated successfully!","success");
 } else {
 saved = await AdminProductAPI.create(payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Product created successfully!","success");
 }
 
 if (isDraftOnly) {
 setProductModal(saved);
 } else {
 setProductModal(null);
 }
 loadData();
 } catch {
 showToast("Failed to save product","error");
 } finally {
 setSaving(false);
 }
 }

 async function saveBlog(isDraftOnly: boolean) {
 if (!blogModal) return;
 try {
 setSaving(true);
 const payload = { ...blogModal, siteId: brandId };
 let saved: BlogPost;
 if (blogModal.id) {
 saved = await AdminBlogAPI.update(blogModal.id, payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Blog post updated successfully!","success");
 } else {
 saved = await AdminBlogAPI.create(payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Blog post created successfully!","success");
 }
 if (isDraftOnly) {
 setBlogModal(saved);
 } else {
 setBlogModal(null);
 }
 loadData();
 } catch {
 showToast("Failed to save blog post","error");
 } finally {
 setSaving(false);
 }
 }

 async function saveFaq(isDraftOnly: boolean) {
 if (!faqModal) return;
 try {
 setSaving(true);
 const payload = { ...faqModal, siteId: brandId };
 let saved: FAQ;
 if (faqModal.id) {
 saved = await AdminFaqAPI.update(faqModal.id, payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"FAQ updated successfully!","success");
 } else {
 saved = await AdminFaqAPI.create(payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"FAQ created successfully!","success");
 }
 if (isDraftOnly) {
 setFaqModal(saved);
 } else {
 setFaqModal(null);
 }
 loadData();
 } catch {
 showToast("Failed to save FAQ","error");
 } finally {
 setSaving(false);
 }
 }

 async function saveCategory(isDraftOnly: boolean) {
 if (!categoryModal) return;
 try {
 setSaving(true);
 const payload = { ...categoryModal, siteId: brandId };
 let saved: Category;
 if (categoryModal.id) {
 saved = await AdminCategoryAPI.update(categoryModal.id, payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Category updated successfully!","success");
 } else {
 saved = await AdminCategoryAPI.create(payload);
 showToast(isDraftOnly ?"Draft progress saved successfully!" :"Category created successfully!","success");
 }
 if (isDraftOnly) {
 setCategoryModal(saved);
 } else {
 setCategoryModal(null);
 }
 loadData();
 } catch {
 showToast("Failed to delete category","error");
 } finally {
 setSaving(false);
 }
 }

 return (
 <div className="space-y-6 max-w-6xl mx-auto">
 {toast && (
 <div className={cn(
"fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold shadow-lg backdrop-blur-md animate-fade-in",
 toast.type ==="success" ?"border-emerald-500/20 bg-emerald-500/10 text-emerald-600" :"border-red-500/20 bg-red-500/10 text-red-600"
 )}>
 <span>{toast.type ==="success" ?"✅" :"❌"}</span>
 <span>{toast.msg}</span>
 </div>
 )}

 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5 gap-4">
 <div className="space-y-1">
 <h1 className="text-xl font-bold tracking-tight text-zinc-900">Content Creator</h1>
 <p className="text-xs text-zinc-500 font-medium">
 Manage products, blogs, FAQs, and categories under brand scope:{""}
 <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
 {brandId}
 </span>
 </p>
 </div>

 <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-zinc-200 shrink-0 select-none">
 {([
 { id:"products", label:"📦 Products" },
 { id:"blogs", label:"📝 Blog Posts" },
 { id:"faqs", label:"❓ FAQs" },
 { id:"categories", label:"🏷️ Categories" }
 ] as const).map(t => (
 <button
 key={t.id}
 className={cn(
"px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
 activeTab === t.id
 ?"bg-white shadow-sm text-zinc-900"
 :"text-zinc-500 hover:text-zinc-900"
 )}
 onClick={() => { setActiveTab(t.id); setSearch(""); }}
 >
 {t.label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 mb-4">
 <div className="w-full sm:w-64">
 <Input
 type="search"
 placeholder="Search records..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="h-9"
 />
 </div>
 
 <Button
 onClick={() => {
 if (activeTab ==="products") {
 setProductModal(emptyProduct());
 setModalSubTab("basic");
 } else if (activeTab ==="blogs") {
 setBlogModal({ title:"", slug:"", content:"", excerpt:"", author: { name:"", role:"" }, readTime: 5, category:"email-migration" });
 } else if (activeTab ==="faqs") {
 setFaqModal({ question:"", answer:"", category:"general" });
 } else if (activeTab ==="categories") {
 setCategoryModal({ label:"", description:"", icon:"", color:"#6366f1" });
 }
 }}
 size="sm"
 className="h-9 px-4 gap-1.5 shadow-sm"
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
 <line x1="12" y1="5" x2="12" y2="19" />
 <line x1="5" y1="12" x2="19" y2="12" />
 </svg>
 Add {activeTab ==="products" ?"Product" : activeTab ==="blogs" ?"Blog" : activeTab ==="faqs" ?"FAQ" :"Category"}
 </Button>
 </div>

 {/* MODALS */}
 {productModal && (
 <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
 {/* Header Bar */}
 <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 shrink-0">
 <div className="flex items-center gap-4">
 <span 
 className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 transition-colors select-none" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setProductModal(null);
 }
 }} 
 title="Exit Workspace"
 >
 ←
 </span>
 <h2 className="text-lg font-bold text-zinc-900">
 {productModal.id ?`Editing Product: ${productModal.name}` :"Create New Product"}
 </h2>
 <span className={cn(
"text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
 productModal.enabled !== false 
 ?"bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
 :"bg-amber-500/10 border-amber-500/20 text-amber-600"
 )}>
 {productModal.enabled !== false ?"Published" :"Draft"}
 </span>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 mr-3 select-none">
 <span className="text-xs font-semibold text-zinc-500">Listed on Storefront:</span>
 <label className="relative inline-flex items-center cursor-pointer">
 <input 
 type="checkbox" 
 checked={productModal.enabled !== false} 
 onChange={e => setProductModal({ ...productModal, enabled: e.target.checked })} 
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
 </label>
 </div>

 <Button 
 variant="outline"
 size="sm"
 disabled={saving}
 onClick={() => saveProduct(true)}
 >
 Save Draft
 </Button>
 <Button 
 size="sm"
 disabled={saving}
 onClick={() => saveProduct(false)}
 >
 Publish & Exit
 </Button>
 <button 
 className="text-zinc-400 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setProductModal(null);
 }
 }}
 >
 ✕
 </button>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden">
 {/* Left Sidebar Navigator */}
 <aside className="w-56 bg-card border-r border-zinc-200 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
 {(["basic","tech","pricing","comparison","requirements","howItWorks","faqs","screenshots","reviews","seo","api"] as const).map(tab => (
 <button
 key={tab}
 type="button"
 className={cn(
"w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer border-0 bg-transparent",
 modalSubTab === tab
 ?"text-blue-600 bg-blue-50/50"
 :"text-zinc-500 hover:text-zinc-900 hover:bg-zinc-150"
 )}
 onClick={() => setModalSubTab(tab)}
 >
 {tab ==="basic" &&"📝 Basic Info"}
 {tab ==="tech" &&"⚙️ Specs & Tech"}
 {tab ==="pricing" &&"💵 Pricing Tiers"}
 {tab ==="comparison" &&"⚖️ License Compare"}
 {tab ==="requirements" &&"⚙️ Sys Requirements"}
 {tab ==="howItWorks" &&"🔄 How It Works"}
 {tab ==="faqs" &&"❓ FAQs"}
 {tab ==="screenshots" &&"🖼️ Screenshots"}
 {tab ==="reviews" &&"★ Reviews"}
 {tab ==="seo" &&"🔍 SEO Settings"}
 {tab ==="api" &&"🔌 Integration API"}
 </button>
 ))}
 </aside>

 {/* Right Editing Canvas */}
 <main className="flex-1 p-8 overflow-y-auto bg-white">
 <form onSubmit={handleSaveProduct} className="max-w-3xl mx-auto">
 {/* TAB 1: BASIC INFO */}
 {modalSubTab ==="basic" && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Product Name</label>
 <Input type="text" value={productModal.name ||""} onChange={e => setProductModal({...productModal, name: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Slug</label>
 <Input type="text" value={productModal.slug ||""} onChange={e => setProductModal({...productModal, slug: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Price ($) - Fallback</label>
 <Input type="number" step="0.01" value={productModal.price || 0} onChange={e => setProductModal({...productModal, price: parseFloat(e.target.value)})} required />
 </div>
 <div className="space-y-1.5">
 <div className="flex justify-between items-center mb-0.5">
 <label className="text-xs font-semibold text-zinc-500">Category</label>
 <button
 type="button"
 className="text-[10px] font-bold text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
 onClick={() => setShowInlineCategoryForm(!showInlineCategoryForm)}
 >
 {showInlineCategoryForm ?"✕ Cancel" :"＋ New Category"}
 </button>
 </div>
 
 {!showInlineCategoryForm ? (
 <Select 
 value={productModal.category ||""} 
 onChange={e => setProductModal({...productModal, category: e.target.value})} 
 required 
 >
 <option value="" disabled>Select a Category</option>
 {categories.map(c => (
 <option key={c.id} value={c.id}>{c.label}</option>
 ))}
 </Select>
 ) : (
 <div className="space-y-2 p-3 rounded-lg border border-zinc-200 bg-card">
 <Input 
 type="text" 
 placeholder="Category name (e.g. Backup)" 
 value={newCategoryForm.label}
 onChange={e => setNewCategoryForm({ ...newCategoryForm, label: e.target.value })}
 />
 <Input 
 type="text" 
 placeholder="Description..." 
 value={newCategoryForm.description}
 onChange={e => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
 />
 <div className="flex gap-2 items-center">
 <Input 
 type="text" 
 placeholder="Icon (e.g. database)" 
 value={newCategoryForm.icon}
 onChange={e => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
 className="flex-1"
 />
 <input 
 type="color" 
 className="w-9 h-9 p-0 border-0 cursor-pointer rounded bg-zinc-150"
 value={newCategoryForm.color}
 onChange={e => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
 />
 <Button 
 type="button" 
 size="sm"
 disabled={newCategorySaving}
 onClick={handleCreateCategoryInline}
 >
 Save
 </Button>
 </div>
 </div>
 )}
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Version</label>
 <Input type="text" value={productModal.version ||""} onChange={e => setProductModal({...productModal, version: e.target.value})} />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Badge</label>
 <Select value={productModal.badge ||""} onChange={e => setProductModal({...productModal, badge: (e.target.value || undefined) as any})}>
 <option value="">No Badge</option>
 <option value="bestseller">🏆 Bestseller</option>
 <option value="new">✨ New</option>
 <option value="popular">🔥 Popular</option>
 <option value="updated">🔄 Updated</option>
 </Select>
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Trial Download URL</label>
 <Input type="text" value={productModal.trialDownloadUrl ||""} onChange={e => setProductModal({...productModal, trialDownloadUrl: e.target.value})} placeholder="e.g. /download/trial?product=pst-converter" />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Short Description</label>
 <Input type="text" value={productModal.shortDescription ||""} onChange={e => setProductModal({...productModal, shortDescription: e.target.value})} required />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Long Description (Markdown Supported)</label>
 <MarkdownEditor
 id="product-description"
 value={productModal.description ||""}
 onChange={val => setProductModal({ ...productModal, description: val })}
 rows={10}
 placeholder="Write a detailed product description in Markdown...\n\n## Features\n- **Bold** feature\n- Another point\n\n## How it works\n1. Step one\n2. Step two"
 required
 />
 </div>
 </div>
 </div>
 )}

 {/* TAB 2: TECHNICAL SPECS */}
 {modalSubTab ==="tech" && (
 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-xs font-semibold text-zinc-500">Features List (Type and press Enter)</label>
 <div className="flex gap-2">
 <Input 
 type="text" 
 id="new-feature-input" 
 placeholder="Add a product feature..." 
 className="flex-1"
 onKeyDown={e => {
 if (e.key ==="Enter") {
 e.preventDefault();
 const val = (e.target as HTMLInputElement).value.trim();
 if (val) {
 const currentFeatures = productModal.features || [];
 setProductModal({ ...productModal, features: [...currentFeatures, val] });
 (e.target as HTMLInputElement).value ="";
 }
 }
 }}
 />
 <Button 
 type="button" 
 onClick={() => {
 const input = document.getElementById("new-feature-input") as HTMLInputElement;
 const val = input?.value.trim();
 if (val) {
 const currentFeatures = productModal.features || [];
 setProductModal({ ...productModal, features: [...currentFeatures, val] });
 input.value ="";
 }
 }}
 >
 Add
 </Button>
 </div>
 <div className="flex flex-wrap gap-2 pt-1">
 {(productModal.features || []).map((feat, idx) => (
 <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-card border border-zinc-200 rounded-full text-xs">
 <span className="text-zinc-700">{feat}</span>
 <button 
 type="button" 
 className="text-zinc-400 hover:text-red-500 font-bold border-0 bg-transparent cursor-pointer"
 onClick={() => {
 const filtered = (productModal.features || []).filter((_, i) => i !== idx);
 setProductModal({ ...productModal, features: filtered });
 }}
 >
 ×
 </button>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-semibold text-zinc-500">Supported Platforms</label>
 <div className="flex gap-4">
 {["Windows","macOS","Linux"].map(platform => {
 const checked = (productModal.platforms || []).includes(platform);
 return (
 <label key={platform} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
 <input 
 type="checkbox" 
 checked={checked}
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 onChange={e => {
 const current = productModal.platforms || [];
 if (e.target.checked) {
 setProductModal({ ...productModal, platforms: [...current, platform] });
 } else {
 setProductModal({ ...productModal, platforms: current.filter(p => p !== platform) });
 }
 }}
 />
 <span>{platform}</span>
 </label>
 );
 })}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Supported Formats (comma-separated)</label>
 <Input 
 type="text" 
 value={(productModal.supportedFormats || []).join(",")}
 onChange={e => {
 const arr = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
 setProductModal({ ...productModal, supportedFormats: arr });
 }}
 placeholder="e.g. PST, OST, EML, MSG, MBOX"
 />
 </div>

 <div className="space-y-2">
 <label className="text-xs font-semibold text-zinc-500">Related Products</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
 {products.filter(p => p.id !== productModal.id).map(p => {
 const checked = (productModal.relatedProductIds || []).includes(p.id!);
 return (
 <label key={p.id} className="flex items-center gap-2 p-2 rounded border border-zinc-200 bg-card/50 text-xs cursor-pointer select-none">
 <input 
 type="checkbox" 
 checked={checked}
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 onChange={e => {
 const current = productModal.relatedProductIds || [];
 if (e.target.checked) {
 setProductModal({ ...productModal, relatedProductIds: [...current, p.id!] });
 } else {
 setProductModal({ ...productModal, relatedProductIds: current.filter(id => id !== p.id) });
 }
 }}
 />
 <span className="truncate">{p.name}</span>
 </label>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: PRICING TIERS */}
 {modalSubTab ==="pricing" && (
 <div className="space-y-6">
 <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
 <h3 className="text-sm font-bold text-zinc-900">Configure Tiers</h3>
 <Button 
 type="button" 
 size="sm"
 variant="outline"
 className="h-8 text-xs border-dashed"
 onClick={() => {
 const current = productModal.pricing || [];
 setProductModal({
 ...productModal,
 pricing: [...current, { name:"New Tier", price: 59.00, originalPrice: 99.00, period:"lifetime", features: ["1 PC License","Free lifetime support"], cta:"" }]
 });
 }}
 >
 ＋ Add Tier
 </Button>
 </div>

 {(productModal.pricing || []).map((tier, idx) => (
 <Card key={idx} className="bg-card/50 border border-zinc-200 p-4">
 <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tier #{idx + 1}</span>
 <button 
 type="button" 
 className="text-xs font-semibold text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
 onClick={() => {
 const filtered = (productModal.pricing || []).filter((_, i) => i !== idx);
 setProductModal({ ...productModal, pricing: filtered });
 }}
 >
 Delete Tier
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Tier Name</label>
 <Input 
 type="text" 
 value={tier.name ||""} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, name: e.target.value };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Price ($)</label>
 <Input 
 type="number" 
 step="0.01"
 value={tier.price ?? 0} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, price: parseFloat(e.target.value) || 0 };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Original Price ($)</label>
 <Input 
 type="number" 
 step="0.01"
 value={tier.originalPrice ?? 0} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, originalPrice: parseFloat(e.target.value) || undefined };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Billing Period</label>
 <Select 
 value={tier.period ||"lifetime"} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, period: e.target.value as any };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 >
 <option value="lifetime">Lifetime</option>
 <option value="yearly">Yearly</option>
 <option value="monthly">Monthly</option>
 </Select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Devices / Mailboxes Limit</label>
 <Input 
 type="text" 
 value={tier.mailboxes ||""} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, mailboxes: e.target.value };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 placeholder="e.g. 1 PC or 50 Mailboxes"
 />
 </div>
 <div className="flex items-center pt-5">
 <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
 <input 
 type="checkbox" 
 checked={!!tier.popular} 
 className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, popular: e.target.checked };
 setProductModal({ ...productModal, pricing: updated });
 }}
 />
 <span>Popular Display Tier</span>
 </label>
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Custom Purchase/CTA URL</label>
 <Input 
 type="text" 
 value={tier.cta ||""} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, cta: e.target.value };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 placeholder="Leave blank for dynamic storefront checkout link"
 />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Features (one per line)</label>
 <textarea 
 rows={3} 
 value={(tier.features || []).join("\n")} 
 onChange={e => {
 const updated = [...(productModal.pricing || [])];
 updated[idx] = { ...tier, features: e.target.value.split("\n").map(x => x.trim()).filter(Boolean) };
 setProductModal({ ...productModal, pricing: updated });
 }} 
 required 
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* TAB 3B: LICENSE COMPARISON */}
 {modalSubTab ==="comparison" && (
 <div className="space-y-6">
 <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
 <h3 className="text-sm font-bold text-zinc-900">License Comparison Matrix</h3>
 <Button 
 type="button" 
 size="sm"
 variant="outline"
 className="h-8 text-xs border-dashed"
 onClick={() => {
 const current = productModal.licenseComparison || [];
 setProductModal({
 ...productModal,
 licenseComparison: [...current, { feature: "", trial: "No", personal: "Yes", enterprise: "Yes" }]
 });
 }}
 >
 ＋ Add Row
 </Button>
 </div>
 <div className="space-y-3">
 {(productModal.licenseComparison || []).map((row, idx) => (
 <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative group">
 <button 
 type="button" 
 className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-0 cursor-pointer" 
 onClick={() => {
 const arr = [...(productModal.licenseComparison || [])];
 arr.splice(idx, 1);
 setProductModal({ ...productModal, licenseComparison: arr });
 }}>✕</button>
 
 <Input 
 className="h-8 text-xs font-semibold sm:w-1/3" 
 placeholder="Feature (e.g. Max Files)" 
 value={row.feature} 
 onChange={(e) => {
 const arr = [...(productModal.licenseComparison || [])];
 arr[idx].feature = e.target.value;
 setProductModal({ ...productModal, licenseComparison: arr });
 }} 
 />
 <div className="flex gap-2 w-full sm:w-2/3">
 <Input 
 className="h-8 text-xs flex-1" 
 placeholder="Trial (e.g. No)" 
 value={row.trial} 
 onChange={(e) => {
 const arr = [...(productModal.licenseComparison || [])];
 arr[idx].trial = e.target.value;
 setProductModal({ ...productModal, licenseComparison: arr });
 }} 
 />
 <Input 
 className="h-8 text-xs flex-1" 
 placeholder="Personal (e.g. Yes)" 
 value={row.personal} 
 onChange={(e) => {
 const arr = [...(productModal.licenseComparison || [])];
 arr[idx].personal = e.target.value;
 setProductModal({ ...productModal, licenseComparison: arr });
 }} 
 />
 <Input 
 className="h-8 text-xs flex-1" 
 placeholder="Enterprise (e.g. Yes)" 
 value={row.enterprise} 
 onChange={(e) => {
 const arr = [...(productModal.licenseComparison || [])];
 arr[idx].enterprise = e.target.value;
 setProductModal({ ...productModal, licenseComparison: arr });
 }} 
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 4: SYSTEM REQUIREMENTS */}
 {modalSubTab ==="requirements" && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Operating System Requirements</label>
 <Input 
 type="text" 
 value={productModal.systemRequirements?.os ||""} 
 onChange={e => setProductModal({
 ...productModal,
 systemRequirements: { ...(productModal.systemRequirements || { os:"", processor:"", ram:"", disk:"" }), os: e.target.value }
 })} 
 placeholder="e.g. Windows 11, 10, 8, 7" 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Processor Requirements</label>
 <Input 
 type="text" 
 value={productModal.systemRequirements?.processor ||""} 
 onChange={e => setProductModal({
 ...productModal,
 systemRequirements: { ...(productModal.systemRequirements || { os:"", processor:"", ram:"", disk:"" }), processor: e.target.value }
 })} 
 placeholder="e.g. 1 GHz CPU" 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">RAM Requirements</label>
 <Input 
 type="text" 
 value={productModal.systemRequirements?.ram ||""} 
 onChange={e => setProductModal({
 ...productModal,
 systemRequirements: { ...(productModal.systemRequirements || { os:"", processor:"", ram:"", disk:"" }), ram: e.target.value }
 })} 
 placeholder="e.g. 2 GB RAM" 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Disk Space Requirements</label>
 <Input 
 type="text" 
 value={productModal.systemRequirements?.disk ||""} 
 onChange={e => setProductModal({
 ...productModal,
 systemRequirements: { ...(productModal.systemRequirements || { os:"", processor:"", ram:"", disk:"" }), disk: e.target.value }
 })} 
 placeholder="e.g. 100 MB free space" 
 />
 </div>
 </div>
 </div>
 )}

 {/* TAB 5: HOW IT WORKS */}
 {modalSubTab ==="howItWorks" && (
 <div className="space-y-6">
 <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
 <h3 className="text-sm font-bold text-zinc-900">Workflow Steps</h3>
 <Button 
 type="button" 
 size="sm"
 variant="outline"
 className="h-8 text-xs border-dashed"
 onClick={() => {
 const current = productModal.howItWorks || [];
 setProductModal({
 ...productModal,
 howItWorks: [...current, { step: current.length + 1, title:"New Step", description:"" }]
 });
 }}
 >
 ＋ Add Step
 </Button>
 </div>

 {(productModal.howItWorks || []).map((step, idx) => (
 <Card key={idx} className="bg-card/50 border border-zinc-200 p-4">
 <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Step {idx + 1}</span>
 <button 
 type="button" 
 className="text-xs font-semibold text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
 onClick={() => {
 const filtered = (productModal.howItWorks || []).filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
 setProductModal({ ...productModal, howItWorks: filtered });
 }}
 >
 Remove
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Step Title</label>
 <Input 
 type="text" 
 value={step.title ||""} 
 onChange={e => {
 const updated = [...(productModal.howItWorks || [])];
 updated[idx] = { ...step, title: e.target.value };
 setProductModal({ ...productModal, howItWorks: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Step Number</label>
 <Input 
 type="number" 
 value={step.step || (idx + 1)} 
 onChange={e => {
 const updated = [...(productModal.howItWorks || [])];
 updated[idx] = { ...step, step: parseInt(e.target.value) || (idx + 1) };
 setProductModal({ ...productModal, howItWorks: updated });
 }} 
 required 
 />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Step Description (Markdown Supported)</label>
 <MarkdownEditor
 id={`step-description-${idx}`}
 value={step.description ||""}
 onChange={val => {
 const updated = [...(productModal.howItWorks || [])];
 updated[idx] = { ...step, description: val };
 setProductModal({ ...productModal, howItWorks: updated });
 }}
 rows={3}
 compact
 placeholder="Describe this step..."
 required
 />
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* TAB 6: FAQS */}
 {modalSubTab ==="faqs" && (
 <div className="space-y-6">
 <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
 <h3 className="text-sm font-bold text-zinc-900">Product FAQs</h3>
 <Button 
 type="button" 
 size="sm"
 variant="outline"
 className="h-8 text-xs border-dashed"
 onClick={() => {
 const current = productModal.faqs || [];
 setProductModal({
 ...productModal,
 faqs: [...current, { question:"", answer:"" }]
 });
 }}
 >
 ＋ Add FAQ
 </Button>
 </div>

 {(productModal.faqs || []).map((faq, idx) => (
 <Card key={idx} className="bg-card/50 border border-zinc-200 p-4">
 <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">FAQ #{idx + 1}</span>
 <button 
 type="button" 
 className="text-xs font-semibold text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
 onClick={() => {
 const filtered = (productModal.faqs || []).filter((_, i) => i !== idx);
 setProductModal({ ...productModal, faqs: filtered });
 }}
 >
 Remove
 </button>
 </div>
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Question</label>
 <Input 
 type="text" 
 value={faq.question ||""} 
 onChange={e => {
 const updated = [...(productModal.faqs || [])];
 updated[idx] = { ...faq, question: e.target.value };
 setProductModal({ ...productModal, faqs: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Answer (Markdown Supported)</label>
 <MarkdownEditor
 id={`faq-answer-${idx}`}
 value={faq.answer ||""}
 onChange={val => {
 const updated = [...(productModal.faqs || [])];
 updated[idx] = { ...faq, answer: val };
 setProductModal({ ...productModal, faqs: updated });
 }}
 rows={4}
 compact
 placeholder="Answer this FAQ in detail..."
 required
 />
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* TAB 7a: SCREENSHOTS */}
 {modalSubTab ==="screenshots" && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-zinc-900">Product Screenshots</h3>
 <p className="text-xs text-zinc-500 mt-1">Add high-fidelity mockups or screenshots for the interactive gallery.</p>
 </div>
 <Button type="button" variant="outline" size="sm" onClick={() => {
 setProductModal({ ...productModal, screenshots: [...(productModal.screenshots || []), { url:"", alt:"", caption:"" }] });
 }}>
 + Add Screenshot
 </Button>
 </div>

 {(productModal.screenshots || []).map((shot, idx) => (
 <Card key={idx} className="p-4 border-zinc-200 shadow-sm relative group overflow-visible">
 <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
 <button type="button" onClick={() => {
 const updated = [...(productModal.screenshots || [])];
 updated.splice(idx, 1);
 setProductModal({ ...productModal, screenshots: updated });
 }} className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-xs">
 ✕
 </button>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Image URL</label>
 <div className="flex gap-2">
 <Input 
 type="text" 
 value={shot.url} 
 onChange={e => {
 const updated = [...(productModal.screenshots || [])];
 updated[idx] = { ...shot, url: e.target.value };
 setProductModal({ ...productModal, screenshots: updated });
 }} 
 required 
 placeholder="https://..."
 />
 <div className="relative overflow-hidden w-24 shrink-0">
 <Button type="button" variant="secondary" size="sm" className="w-full text-xs pointer-events-none">Upload</Button>
 <input 
   type="file" 
   accept="image/*" 
   className="absolute inset-0 opacity-0 cursor-pointer"
   onChange={async (e) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const formData = new FormData();
     formData.append("file", file);
     try {
       const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
       const data = await res.json();
       if (data.url) {
         const updated = [...(productModal.screenshots || [])];
         updated[idx] = { ...shot, url: data.url };
         setProductModal({ ...productModal, screenshots: updated });
       }
     } catch (err) {
       console.error("Upload failed", err);
     }
   }}
 />
 </div>
 </div>
 {shot.url && <img src={shot.url} alt="Preview" className="h-20 w-auto rounded border object-contain bg-zinc-50 mt-2" />}
 </div>

 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Alt Text (SEO)</label>
 <Input 
 type="text" 
 value={shot.alt} 
 onChange={e => {
 const updated = [...(productModal.screenshots || [])];
 updated[idx] = { ...shot, alt: e.target.value };
 setProductModal({ ...productModal, screenshots: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Caption (Optional)</label>
 <Input 
 type="text" 
 value={shot.caption ||""} 
 onChange={e => {
 const updated = [...(productModal.screenshots || [])];
 updated[idx] = { ...shot, caption: e.target.value };
 setProductModal({ ...productModal, screenshots: updated });
 }} 
 />
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* TAB 7: REVIEWS */}
 {modalSubTab ==="reviews" && (
 <div className="space-y-6">
 <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
 <h3 className="text-sm font-bold text-zinc-900">Product Reviews</h3>
 <Button 
 type="button" 
 size="sm"
 variant="outline"
 className="h-8 text-xs border-dashed"
 onClick={() => {
 const current = productModal.reviews || [];
 setProductModal({
 ...productModal,
 reviews: [...current, { id:"rev-" + Date.now(), author:"", rating: 5, date: new Date().toISOString().split('T')[0], content:"", role:"", company:"" }]
 });
 }}
 >
 ＋ Add Review
 </Button>
 </div>

 {(productModal.reviews || []).map((review, idx) => (
 <Card key={idx} className="bg-card/50 border border-zinc-200 p-4">
 <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Review #{idx + 1}</span>
 <button 
 type="button" 
 className="text-xs font-semibold text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
 onClick={() => {
 const filtered = (productModal.reviews || []).filter((_, i) => i !== idx);
 setProductModal({ ...productModal, reviews: filtered });
 }}
 >
 Remove
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Author</label>
 <Input 
 type="text" 
 value={review.author ||""} 
 onChange={e => {
 const updated = [...(productModal.reviews || [])];
 updated[idx] = { ...review, author: e.target.value };
 setProductModal({ ...productModal, reviews: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Rating (1-5)</label>
 <Input 
 type="number" 
 min="1"
 max="5"
 value={review.rating || 5} 
 onChange={e => {
 const updated = [...(productModal.reviews || [])];
 updated[idx] = { ...review, rating: parseInt(e.target.value) || 5 };
 setProductModal({ ...productModal, reviews: updated });
 }} 
 required 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Author Role</label>
 <Input 
 type="text" 
 value={review.role ||""} 
 onChange={e => {
 const updated = [...(productModal.reviews || [])];
 updated[idx] = { ...review, role: e.target.value };
 setProductModal({ ...productModal, reviews: updated });
 }} 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Author Company</label>
 <Input 
 type="text" 
 value={review.company ||""} 
 onChange={e => {
 const updated = [...(productModal.reviews || [])];
 updated[idx] = { ...review, company: e.target.value };
 setProductModal({ ...productModal, reviews: updated });
 }} 
 />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Review Content</label>
 <textarea 
 rows={2} 
 value={review.content ||""} 
 onChange={e => {
 const updated = [...(productModal.reviews || [])];
 updated[idx] = { ...review, content: e.target.value };
 setProductModal({ ...productModal, reviews: updated });
 }} 
 required 
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* TAB 8: SEO METADATA */}
 {modalSubTab ==="seo" && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">SEO Meta Title</label>
 <Input 
 type="text" 
 value={productModal.seo?.title ||""} 
 onChange={e => setProductModal({
 ...productModal,
 seo: { ...(productModal.seo || { title:"", description:"", keywords: [] }), title: e.target.value }
 })} 
 placeholder="SEO optimized title..."
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">SEO Meta Description</label>
 <textarea 
 rows={3} 
 value={productModal.seo?.description ||""} 
 onChange={e => setProductModal({
 ...productModal,
 seo: { ...(productModal.seo || { title:"", description:"", keywords: [] }), description: e.target.value }
 })} 
 placeholder="Brief search summary..."
 className="w-full bg-transparent border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">SEO Keywords (comma separated)</label>
 <Input 
 type="text" 
 value={(productModal.seo?.keywords || []).join(",")} 
 onChange={e => {
 const keywordsArray = e.target.value.split(",").map(k => k.trim()).filter(Boolean);
 setProductModal({
 ...productModal,
 seo: { ...(productModal.seo || { title:"", description:"", keywords: [] }), keywords: keywordsArray }
 });
 }} 
 placeholder="e.g. pst converter, outlook migration"
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* TAB 9: INTEGRATION & API LINKS */}
 {modalSubTab ==="api" && (
 <div className="space-y-6">
 <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
 <h3 className="text-sm font-bold text-blue-900 mb-1">Desktop Application Integration Links</h3>
 <p className="text-xs text-blue-800">
 Copy these API endpoint URLs to integrate license activation and update checks directly into your desktop software tool.
 </p>
 </div>
 
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
 <span>1. License Activation API Endpoint (POST)</span>
 <button type="button" className="text-blue-600 hover:underline" onClick={() => {
 navigator.clipboard.writeText(`${window.location.origin}/api/license/activate`);
 showToast("API URL Copied!", "success");
 }}>Copy URL</button>
 </label>
 <code className="block w-full bg-zinc-900 text-zinc-300 rounded-lg px-3 py-2 text-[11px] overflow-x-auto whitespace-nowrap font-mono">
 {`${window.location.origin}/api/license/activate`}
 </code>
 <p className="text-xs text-zinc-500 mt-1">This endpoint validates a license key and binds it to a specific machine ID.</p>
 </div>

 <div className="space-y-2 pt-2 border-t border-zinc-150">
 <label className="text-xs font-bold text-zinc-900">Request JSON Payload Example</label>
 <pre className="block w-full bg-zinc-900 text-zinc-300 rounded-lg px-3 py-3 text-[11px] overflow-x-auto font-mono">
{`{
  "licenseKey": "PST-ELITE-XXXX-XXXX-XXXX",
  "machineId": "HWID-1234-ABCD",
  "machineName": "WIN-DESKTOP-01",
  "osName": "Windows 11",
  "ipAddress": "192.168.1.100" // Optional
}`}
 </pre>
 </div>

 <div className="space-y-2 pt-2 border-t border-zinc-150">
 <label className="text-xs font-bold text-zinc-900">Response JSON Example</label>
 <pre className="block w-full bg-zinc-900 text-zinc-300 rounded-lg px-3 py-3 text-[11px] overflow-x-auto font-mono">
{`{
  "activated": true,
  "message": "Activation successful",
  "activationsRemaining": 2,
  "validTill": "2027-12-31T23:59:59Z",
  "activatedOn": "2026-07-04T10:00:00Z",
  "licenseType": "ELITE"
}`}
 </pre>
 </div>
 </div>
 </div>
 )}
 </form>
 </main>
 </div>
 </div>
 )}

 {blogModal && (
 <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
 {/* Header Bar */}
 <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 shrink-0">
 <div className="flex items-center gap-4">
 <span 
 className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 transition-colors select-none" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setBlogModal(null);
 }
 }} 
 title="Exit Workspace"
 >
 ←
 </span>
 <h2 className="text-lg font-bold text-zinc-900">
 {blogModal.id ?`Editing Blog Post: ${blogModal.title}` :"Create Blog Post"}
 </h2>
 </div>

 <div className="flex items-center gap-3">
 <Button 
 variant="outline"
 size="sm"
 disabled={saving}
 onClick={() => saveBlog(true)}
 >
 Save Draft
 </Button>
 <Button 
 size="sm"
 disabled={saving}
 onClick={() => saveBlog(false)}
 >
 Save & Exit
 </Button>
 <button 
 className="text-zinc-400 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setBlogModal(null);
 }
 }}
 >
 ✕
 </button>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden justify-center bg-card">
 <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white border-x border-zinc-200">
 <form onSubmit={e => { e.preventDefault(); saveBlog(false); }} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Blog Title</label>
 <Input type="text" value={blogModal.title ||""} onChange={e => setBlogModal({...blogModal, title: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Slug</label>
 <Input type="text" value={blogModal.slug ||""} onChange={e => setBlogModal({...blogModal, slug: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Author Name</label>
 <Input type="text" value={blogModal.author?.name ||""} onChange={e => setBlogModal({...blogModal, author: { name: e.target.value, role:"Author" }})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Read Time (minutes)</label>
 <Input type="number" value={blogModal.readTime || 0} onChange={e => setBlogModal({...blogModal, readTime: parseInt(e.target.value) || 0})} placeholder="e.g. 5" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Category</label>
 <Input type="text" value={blogModal.category ||""} onChange={e => setBlogModal({...blogModal, category: e.target.value as any})} />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Excerpt</label>
 <Input type="text" value={blogModal.excerpt ||""} onChange={e => setBlogModal({...blogModal, excerpt: e.target.value})} required />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Content (Markdown Supported)</label>
 <MarkdownEditor
 id="blog-content"
 value={blogModal.content ||""}
 onChange={val => setBlogModal({ ...blogModal, content: val })}
 rows={16}
 placeholder={"Write your blog post in Markdown...\n\n## Introduction\nStart with a compelling opening paragraph.\n\n## Main Topic\n- Key point 1\n- Key point 2\n\n## Conclusion\nWrap up with a summary."}
 required
 />
 </div>
 </div>
 </form>
 </main>
 </div>
 </div>
 )}

 {faqModal && (
 <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
 {/* Header Bar */}
 <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 shrink-0">
 <div className="flex items-center gap-4">
 <span 
 className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 transition-colors select-none" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setFaqModal(null);
 }
 }} 
 title="Exit Workspace"
 >
 ←
 </span>
 <h2 className="text-lg font-bold text-zinc-900">
 {faqModal.id ?"Editing FAQ" :"Create FAQ"}
 </h2>
 </div>

 <div className="flex items-center gap-3">
 <Button 
 variant="outline"
 size="sm"
 disabled={saving}
 onClick={() => saveFaq(true)}
 >
 Save Draft
 </Button>
 <Button 
 size="sm"
 disabled={saving}
 onClick={() => saveFaq(false)}
 >
 Save & Exit
 </Button>
 <button 
 className="text-zinc-400 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setFaqModal(null);
 }
 }}
 >
 ✕
 </button>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden justify-center bg-card">
 <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white border-x border-zinc-200">
 <form onSubmit={e => { e.preventDefault(); saveFaq(false); }} className="space-y-4">
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Question</label>
 <Input type="text" value={faqModal.question ||""} onChange={e => setFaqModal({...faqModal, question: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Answer (Markdown Supported)</label>
 <MarkdownEditor
 value={faqModal.answer ||""}
 onChange={val => setFaqModal({ ...faqModal, answer: val })}
 rows={8}
 placeholder="Answer in Markdown...\n\n**Bold** key terms.\n- List key points\n\nUse`code` for technical terms."
 required
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Category</label>
 <Input type="text" value={faqModal.category ||""} onChange={e => setFaqModal({...faqModal, category: e.target.value as any})} required />
 </div>
 </div>
 </form>
 </main>
 </div>
 </div>
 )}

 {categoryModal && (
 <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
 {/* Header Bar */}
 <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-zinc-200 shrink-0">
 <div className="flex items-center gap-4">
 <span 
 className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 transition-colors select-none" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setCategoryModal(null);
 }
 }} 
 title="Exit Workspace"
 >
 ←
 </span>
 <h2 className="text-lg font-bold text-zinc-900">
 {categoryModal.id ?`Editing Category: ${categoryModal.label}` :"Create Category"}
 </h2>
 </div>

 <div className="flex items-center gap-3">
 <Button 
 variant="outline"
 size="sm"
 disabled={saving}
 onClick={() => saveCategory(true)}
 >
 Save Draft
 </Button>
 <Button 
 size="sm"
 disabled={saving}
 onClick={() => saveCategory(false)}
 >
 Save & Exit
 </Button>
 <button 
 className="text-zinc-400 hover:text-foreground p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
 onClick={() => {
 if (confirm("Any unsaved changes will be lost. Exit?")) {
 setCategoryModal(null);
 }
 }}
 >
 ✕
 </button>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden justify-center bg-card">
 <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white border-x border-zinc-200">
 <form onSubmit={e => { e.preventDefault(); saveCategory(false); }} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Category Label</label>
 <Input type="text" value={categoryModal.label ||""} onChange={e => setCategoryModal({...categoryModal, label: e.target.value})} required />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-500">Color (Hex)</label>
 <div className="flex gap-2 items-center">
 <Input type="text" value={categoryModal.color ||"#6366f1"} onChange={e => setCategoryModal({...categoryModal, color: e.target.value})} required />
 <input 
 type="color" 
 className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-muted"
 value={categoryModal.color ||"#6366f1"}
 onChange={e => setCategoryModal({...categoryModal, color: e.target.value})}
 />
 </div>
 </div>
 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-xs font-semibold text-zinc-500">Icon Identifier</label>
 <Input type="text" value={categoryModal.icon ||""} onChange={e => setCategoryModal({...categoryModal, icon: e.target.value})} placeholder="e.g. database" />
 </div>
 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-xs font-semibold text-zinc-500">Description (Markdown Supported)</label>
 <MarkdownEditor
 value={categoryModal.description ||""}
 onChange={val => setCategoryModal({ ...categoryModal, description: val })}
 rows={4}
 compact
 placeholder="Describe this category..."
 required
 />
 </div>
 </div>
 </form>
 </main>
 </div>
 </div>
 )}

 {/* TABLES */}
 <Card className=" border border-zinc-200 shadow-sm overflow-hidden">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
 <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
 <span className="text-xs font-semibold">Loading records...</span>
 </div>
 ) : (
 <div className="overflow-x-auto">
 {activeTab ==="products" && (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Name</TableHead>
 <TableHead>Category</TableHead>
 <TableHead>Price</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Version</TableHead>
 <TableHead>Badge</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())).map(p => (
 <TableRow key={p.id}>
 <TableCell className="font-semibold text-zinc-900">
 <div className="flex flex-col">
 <span className="font-semibold">{p.name}</span>
 <span className="text-[11px] text-zinc-405 font-mono">/{p.slug}</span>
 </div>
 </TableCell>
 <TableCell>
 <span className="bg-muted border border-zinc-200 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600">{p.category}</span>
 </TableCell>
 <TableCell className="font-medium">${(p.price ?? 0).toFixed(2)}</TableCell>
 <TableCell>
 <button 
 className={cn(
"text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider transition-all cursor-pointer bg-transparent",
 p.enabled !== false 
 ?"bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
 :"bg-red-500/10 border-red-500/20 text-red-600"
 )}
 onClick={async () => {
 try {
 const updated = { ...p, enabled: p.enabled === false };
 await AdminProductAPI.update(p.id, updated);
 showToast(`Product ${updated.enabled ?"enabled" :"disabled"} successfully`,"success");
 loadData();
 } catch {
 showToast("Failed to toggle product status","error");
 }
 }}
 title="Click to toggle active status on storefront"
 >
 {p.enabled !== false ?"Active" :"Disabled"}
 </button>
 </TableCell>
 <TableCell className="font-mono text-xs text-zinc-500">{p.version ||"—"}</TableCell>
 <TableCell>
 {p.badge ? (
 <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">{p.badge}</span>
 ) : (
 <span className="text-zinc-400">—</span>
 )}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1.5">
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setQuickLinksModal(p)}>🔗 Links</Button>
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setProductModal(p); setModalSubTab("basic"); }}>Edit</Button>
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleDeleteProduct(p.id!, p.name)}>Delete</Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}

 {activeTab ==="blogs" && (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Title</TableHead>
 <TableHead>Author</TableHead>
 <TableHead>Category</TableHead>
 <TableHead>Read Time</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author?.name?.toLowerCase().includes(search.toLowerCase())).map(b => (
 <TableRow key={b.id}>
 <TableCell className="font-semibold text-zinc-900">
 <div className="flex flex-col">
 <span className="font-semibold">{b.title}</span>
 <span className="text-[11px] text-zinc-405 font-mono">/{b.slug}</span>
 </div>
 </TableCell>
 <TableCell className="font-medium text-zinc-700">{b.author?.name ||"Unknown"}</TableCell>
 <TableCell>
 <span className="bg-muted border border-zinc-200 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600">{b.category}</span>
 </TableCell>
 <TableCell className="text-zinc-500 text-xs font-mono">{b.readTime ||"—"} min</TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1.5">
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setBlogModal(b)}>Edit</Button>
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleDeleteBlog(b.id!, b.title)}>Delete</Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}

 {activeTab ==="faqs" && (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Question</TableHead>
 <TableHead>Answer</TableHead>
 <TableHead>Category</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())).map(f => (
 <TableRow key={f.id}>
 <TableCell className="font-semibold text-zinc-900" style={{ width:"30%" }}>{f.question}</TableCell>
 <TableCell className="text-zinc-500 text-xs max-w-[350px] truncate">{f.answer}</TableCell>
 <TableCell>
 <span className="bg-muted border border-zinc-200 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600">{f.category}</span>
 </TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1.5">
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setFaqModal(f)}>Edit</Button>
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleDeleteFaq(f.id!)}>Delete</Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}

 {activeTab ==="categories" && (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Label</TableHead>
 <TableHead>Color</TableHead>
 <TableHead>Icon</TableHead>
 <TableHead>Description</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {categories.filter(c => c.label.toLowerCase().includes(search.toLowerCase())).map(c => (
 <TableRow key={c.id}>
 <TableCell className="font-semibold text-zinc-900">{c.label}</TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.color }} />
 <code className="text-xs text-zinc-500 font-mono">{c.color}</code>
 </div>
 </TableCell>
 <TableCell className="font-mono text-xs text-zinc-500"><code>{c.icon}</code></TableCell>
 <TableCell className="text-zinc-500 text-xs max-w-sm truncate">{c.description}</TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1.5">
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setCategoryModal(c)}>Edit</Button>
 <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleDeleteCategory(c.id!, c.label)}>Delete</Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </div>
 )}
 </Card>

 {/* QUICK LINKS MODAL */}
 {quickLinksModal && (
 <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setQuickLinksModal(null)}>
 <Card className="w-full max-w-xl border border-zinc-200 shadow-xl" onClick={e => e.stopPropagation()}>
 <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-150">
 <div className="space-y-1">
 <CardTitle>🔗 Quick Product Links</CardTitle>
 <CardDescription>Copy target URLs for <strong>{quickLinksModal.name}</strong>.</CardDescription>
 </div>
 <button className="text-zinc-405 hover:text-zinc-900 font-bold border-0 bg-transparent cursor-pointer" onClick={() => setQuickLinksModal(null)}>✕</button>
 </CardHeader>
 <CardContent className="py-4 space-y-3 max-h-[450px] overflow-y-auto">
 <p className="italic text-xs text-zinc-500">
 Configure URL root: <code>{siteUrl}</code>
 </p>
 {[
 { label:"Home Page", url: siteUrl },
 { label:"Product Page", url:`${siteUrl}/products/${quickLinksModal.slug}` },
 { label:"Buy Page", url:`${siteUrl}/products/${quickLinksModal.slug}/buy` },
 { label:"User Guide Page", url:`${siteUrl}/products/${quickLinksModal.slug}/guide` },
 { label:"Support Page", url:`${siteUrl}/support` },
 { label:"Upgrade Page", url:`${siteUrl}/upgrade` },
 { label:"License Activation API", url:`${API_BASE}/license/activate` },
 { label:"FAQ Section Anchor", url:`${siteUrl}/products/${quickLinksModal.slug}#faq` },
 { label:"Privacy Policy", url:`${siteUrl}/privacy-policy` },
 { label:"Terms of Service", url:`${siteUrl}/terms-of-service` },
 { label:"Refund Policy", url:`${siteUrl}/refund-policy` }
 ].map((item, idx) => (
 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border last:border-0 last:pb-0">
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 w-36 shrink-0">{item.label}</span>
 <span className="text-xs font-mono bg-card border border-zinc-200 px-2 py-1 rounded truncate flex-1" title={item.url}>{item.url}</span>
 <Button
 size="sm"
 variant="outline"
 className="h-7 px-2.5 text-xs shrink-0"
 onClick={() => {
 navigator.clipboard.writeText(item.url);
 setCopiedLink(item.label);
 setTimeout(() => setCopiedLink(null), 2000);
 }}
 >
 {copiedLink === item.label ?"Copied!" :"Copy"}
 </Button>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 )}
 </div>
 );
}
