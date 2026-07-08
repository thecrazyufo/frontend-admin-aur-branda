"use client";

import { useEffect, useState, useRef, FormEvent, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  AdminProductAPI, 
  AdminBlogAPI, 
  AdminFaqAPI, 
  AdminCategoryAPI,
  AdminSettingsAPI,
  AdminRegistryAPI,
  AdminHelpAPI,
  AdminCareerAPI,
  API_BASE
} from "@/services/api";
import { SourceFormat, TargetFormat, SupportedClient, KeyFeature } from "@/types/registry";
import { Product } from "@/types/product";
import { BlogPost } from "@/types/blog";
import { FAQ } from "@/types/faq";
import { Category } from "@/services/api";
import { HelpArticle, HELP_CATEGORY_LABELS, HelpCategory, CareerPosition } from "@/types/common";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface ConditionalField {
  label: string;
  type: "select" | "toggle";
  options?: string[];
  key: string;
  description?: string;
}

const CATEGORY_CONDITIONAL_FIELDS: Record<string, ConditionalField[]> = {
  "duplicate": [
    {
      label: "Scan Level",
      type: "select",
      options: ["File Name Only", "File Content Only", "Both (Full Analysis)"],
      key: "scanLevel",
      description: "Define the level of deduplication analysis."
    }
  ],
  "migration": [
    {
      label: "Supports Incremental Sync",
      type: "toggle",
      key: "supportsIncrementalSync",
      description: "Enable differential/delta sync for subsequent runs."
    }
  ]
};

type Tab = "products" | "blogs" | "faqs" | "categories" | "help" | "jobs";

interface ProductMultiSelectProps {
  products: any[];
  selectedIds: string[];
  onChange: (ids: string[], addedId?: string) => void;
  placeholder?: string;
}

function ProductMultiSelect({ products, selectedIds, onChange, placeholder = "Search and select products..." }: ProductMultiSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProducts = products.filter(p => selectedIds.includes(p.id));
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredProducts.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleProduct = (id: string) => {
    const isAdding = !selectedIds.includes(id);
    const next = isAdding
      ? [...selectedIds, id]
      : selectedIds.filter(x => x !== id);
    onChange(next, isAdding ? id : undefined);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {/* Selected chips and status */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-9 p-1.5 w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        {selectedProducts.map(p => (
          <span 
            key={p.id} 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700/60 animate-fade-in"
          >
            {p.name}
            <button
              type="button"
              onClick={() => toggleProduct(p.id)}
              className="text-[10px] text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-0.5 border-0 bg-transparent cursor-pointer"
            >
              ✕
            </button>
          </span>
        ))}
        {selectedIds.length === 0 && (
          <span className="text-xs text-zinc-400 ml-1.5 select-none">{placeholder}</span>
        )}
        <div className="ml-auto pr-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            {selectedIds.length} selected
          </span>
        </div>
      </div>

      {/* Button to open dropdown / Search query input */}
      <div className="relative">
        <Input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Filter products by name or category..."
          className="pr-8"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 border-0 bg-transparent cursor-pointer"
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {Object.keys(grouped).length === 0 ? (
            <div className="p-3 text-xs text-zinc-400 text-center">No products found</div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="p-2 space-y-1">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  📁 {category}
                </span>
                <div className="space-y-0.5">
                  {(items as any[]).map((p: any) => {
                    const isChecked = selectedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors",
                          isChecked 
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium" 
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300"
                        )}
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] font-mono text-zinc-405 dark:text-zinc-500">({p.id})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const emptyProduct = (): Partial<Product> => ({
  name: "",
  slug: "",
  price: 0,
  category: "email-migration",
  description: "",
  shortDescription: "",
  version: "1.0.0",
  badge: undefined,
  trialDownloadUrl: "",
  installationSuccessUrl: "",
  uninstallationSuccessUrl: "",
  features: [],
  platforms: ["Windows"],
  supportedFormats: [],
  pricing: [
    { name: "Standard License", price: 49.00, period: "lifetime", features: ["1 Mailbox migration", "Free 1-year updates", "24/7 technical support"], cta: "" }
  ],
  systemRequirements: { os: "Windows 11/10/8/7 (32/64 bit)", processor: "1 GHz Intel/AMD processor", ram: "2 GB", disk: "100 MB" },
  howItWorks: [
    { step: 1, title: "Download & Install", description: "Download the software and install it on your PC." },
    { step: 2, title: "Add PST File", description: "Launch the software and select the Outlook PST file you want to convert." },
    { step: 3, title: "Select Output", description: "Choose the output format and destination path." },
    { step: 4, title: "Convert & Export", description: "Click Convert to export your mailbox items." }
  ],
  faqs: [
    { question: "Can I convert large PST files?", answer: "Yes, our software has no file size limit and can convert large PST files without data loss." }
  ],
  reviews: [
    { id: "rev-1", author: "John D.", rating: 5, date: new Date().toISOString().split('T')[0], content: "Excellent converter, saved me hours of work!", role: "System Administrator", company: "Tech Solutions" }
  ],
  relatedProductIds: [],
  sourceFormats: [],
  targetFormats: [],
  capabilities: {},
  seo: {
    title: "",
    description: "",
    keywords: []
  },
  enabled: true
});

function HTMLToolbar({ 
  value, 
  onChange, 
  textareaId 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  textareaId: string; 
}) {
  const [uploading, setUploading] = useState(false);

  const insertTag = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + (selected || "") + tagClose;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selected || "").length);
    }, 50);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("admin_jwt");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload image file");
      }

      const data = await response.json();
      const imageUrl = data.url;

      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const replacement = `<img src="${imageUrl}" alt="${file.name}" class="rounded-xl my-4 mx-auto max-w-full" />`;
        const newValue = text.substring(0, start) + replacement + text.substring(end);
        onChange(newValue);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-lg shrink-0 select-none">
      <button
        type="button"
        className="px-2 py-0.5 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        onClick={() => insertTag("<strong>", "</strong>")}
        title="Bold text"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className="px-2 py-0.5 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        onClick={() => insertTag("<em>", "</em>")}
        title="Italic text"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className="px-2 py-0.5 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        onClick={() => insertTag("<a href=\"URL\" target=\"_blank\">", "</a>")}
        title="Insert link"
      >
        🔗 Link
      </button>
      <button
        type="button"
        className="px-2 py-0.5 text-xs font-semibold rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}
        title="Unordered list"
      >
        • List
      </button>
      
      <label className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer px-2 py-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
        {uploading ? "⏳..." : "🖼️ Image"}
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: "none" }} 
          onChange={handleImageUpload} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}

export default function ContentCreatorPage() {
  return (
    <Suspense fallback={<div className="text-xs text-stone-500 font-semibold p-8 animate-pulse">Loading manager...</div>}>
      <ContentCreatorContent />
    </Suspense>
  );
}

function ContentCreatorContent() {
  const params = useParams();
  const brandId = (params?.brandId as string) || "";
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as Tab | null;

  const [activeTab, setActiveTab] = useState<Tab>("products");

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    } else {
      setActiveTab("products");
    }
  }, [queryTab]);

  useEffect(() => {
    if (searchParams && searchParams.get("action") === "new-product") {
      setProductModal(emptyProduct());
      setModalSubTab("basic");
      
      // Clean up the URL parameter
      try {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.delete("action");
        const newSearch = queryParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState(null, "", newUrl);
      } catch (e) {
        console.error("Failed to clean query param", e);
      }
    }
  }, [searchParams, queryTab]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [jobs, setJobs] = useState<CareerPosition[]>([]);
  const [sourceFormatsRegistry, setSourceFormatsRegistry] = useState<SourceFormat[]>([]);
  const [targetFormatsRegistry, setTargetFormatsRegistry] = useState<TargetFormat[]>([]);
  const [supportedClientsRegistry, setSupportedClientsRegistry] = useState<SupportedClient[]>([]);
  const [keyFeaturesRegistry, setKeyFeaturesRegistry] = useState<KeyFeature[]>([]);

  // Search
  const [search, setSearch] = useState("");

  // Modals state
  const [productModal, setProductModal] = useState<Partial<Product> | null>(null);
  const [modalSubTab, setModalSubTab] = useState<"basic" | "tech" | "pricing" | "requirements" | "howItWorks" | "faqs" | "reviews" | "seo">("basic");
  const [siteUrl, setSiteUrl] = useState("https://www.pstconverter.com");
  const [quickLinksModal, setQuickLinksModal] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [blogModal, setBlogModal] = useState<Partial<BlogPost> | null>(null);
  const [faqModal, setFaqModal] = useState<Partial<FAQ> | null>(null);
  const [categoryModal, setCategoryModal] = useState<Partial<Category> | null>(null);
  const [helpModal, setHelpModal] = useState<Partial<HelpArticle> | null>(null);
  const [jobModal, setJobModal] = useState<Partial<CareerPosition> | null>(null);
  const [saving, setSaving] = useState(false);

  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [isDraftChecked, setIsDraftChecked] = useState(false);

  // Check for local draft when opening the modal
  useEffect(() => {
    if (typeof window !== "undefined" && productModal) {
      const draftKey = "prism_product_draft_" + (productModal.id || "new");
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const isDifferent = JSON.stringify(parsed) !== JSON.stringify(productModal);
          if (isDifferent) {
            setHasLocalDraft(true);
            setIsDraftChecked(false);
          } else {
            setHasLocalDraft(false);
            setIsDraftChecked(true);
          }
        } catch {
          setHasLocalDraft(false);
          setIsDraftChecked(true);
        }
      } else {
        setHasLocalDraft(false);
        setIsDraftChecked(true);
      }
    } else {
      setHasLocalDraft(false);
      setIsDraftChecked(false);
    }
  }, [productModal?.id, productModal === null]);

  // Auto-save useEffect — only saves after draft check is completed/restored/discarded
  useEffect(() => {
    if (typeof window !== "undefined" && productModal && isDraftChecked) {
      const draftKey = "prism_product_draft_" + (productModal.id || "new");
      localStorage.setItem(draftKey, JSON.stringify(productModal));
    }
  }, [productModal, isDraftChecked]);

  // Dynamic inline category states
  const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ label: "", description: "", icon: "database", color: "#6366f1" });
  const [newCategorySaving, setNewCategorySaving] = useState(false);

  async function handleCreateCategoryInline() {
    if (!newCategoryForm.label.trim()) {
      alert("Category label is required");
      return;
    }
    try {
      setNewCategorySaving(true);
      const categoryId = newCategoryForm.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

      showToast("New category added and assigned!", "success");
      setNewCategoryForm({ label: "", description: "", icon: "database", color: "#6366f1" });
      setShowInlineCategoryForm(false);
    } catch {
      showToast("Failed to create inline category", "error");
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
      const [ps, bs, fs, cs, hs, js, settings, registrySF, registryTF, registrySC, registryKF] = await Promise.all([
        AdminProductAPI.getAll(),
        AdminBlogAPI.getAll(),
        AdminFaqAPI.getAll(),
        AdminCategoryAPI.getAll(),
        AdminHelpAPI.getAll().catch(() => []),
        AdminCareerAPI.getAll().catch(() => []),
        AdminSettingsAPI.get().catch(() => null),
        AdminRegistryAPI.getSourceFormats().catch(() => []),
        AdminRegistryAPI.getTargetFormats().catch(() => []),
        AdminRegistryAPI.getSupportedClients().catch(() => []),
        AdminRegistryAPI.getKeyFeatures().catch(() => [])
      ]);
      setProducts(ps.filter(x => x.siteId === brandId));
      setBlogs(bs.filter(x => x.siteId === brandId));
      setFaqs(fs.filter(x => x.siteId === brandId));
      setCategories(cs.filter(x => x.siteId === brandId));
      setHelpArticles(hs.filter(x => x.siteId === brandId));
      setJobs(js.filter(x => x.siteId === brandId));
      setSourceFormatsRegistry(registrySF);
      setTargetFormatsRegistry(registryTF);
      setSupportedClientsRegistry(registrySC);
      setKeyFeaturesRegistry(registryKF);
      if (settings && settings.url) {
        setSiteUrl(settings.url);
      }
    } catch {
      showToast("Failed to load storefront contents", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Delete Handlers
  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await AdminProductAPI.delete(id);
      setProducts(prev => prev.filter(x => x.id !== id));
      showToast("Product deleted successfully", "success");
    } catch {
      showToast("Failed to delete product", "error");
    }
  }

  async function handleDeleteBlog(id: string, title: string) {
    if (!confirm(`Delete blog post "${title}"?`)) return;
    try {
      await AdminBlogAPI.delete(id);
      setBlogs(prev => prev.filter(x => x.id !== id));
      showToast("Blog post deleted successfully", "success");
    } catch {
      showToast("Failed to delete blog post", "error");
    }
  }

  async function handleDeleteFaq(id: string) {
    if (!confirm(`Delete this FAQ?`)) return;
    try {
      await AdminFaqAPI.delete(id);
      setFaqs(prev => prev.filter(x => x.id !== id));
      showToast("FAQ deleted successfully", "success");
    } catch {
      showToast("Failed to delete FAQ", "error");
    }
  }

  async function handleDeleteCategory(id: string, label: string) {
    if (!confirm(`Delete category "${label}"?`)) return;
    try {
      await AdminCategoryAPI.delete(id);
      setCategories(prev => prev.filter(x => x.id !== id));
      showToast("Category deleted successfully", "success");
    } catch {
      showToast("Failed to delete category", "error");
    }
  }

  async function handleDeleteHelpArticle(id: string, title: string) {
    if (!confirm(`Delete guide article "${title}"?`)) return;
    try {
      await AdminHelpAPI.delete(id);
      setHelpArticles(prev => prev.filter(x => x.id !== id));
      showToast("Guide article deleted successfully", "success");
    } catch {
      showToast("Failed to delete guide article", "error");
    }
  }

  async function handleDeleteJob(id: string, title: string) {
    if (!confirm(`Delete job posting "${title}"?`)) return;
    try {
      await AdminCareerAPI.delete(id);
      setJobs(prev => prev.filter(x => x.id !== id));
      showToast("Job posting deleted successfully", "success");
    } catch {
      showToast("Failed to delete job posting", "error");
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

      let nameVal = productModal.name?.trim();
      let slugVal = productModal.slug?.trim();
      let catVal = productModal.category;

      if (isDraftOnly) {
        if (!nameVal) nameVal = "Untitled Draft Product";
        if (!slugVal) {
          slugVal = "untitled-draft-" + Math.random().toString(36).substring(2, 7);
        }
        if (!catVal) catVal = "email-migration";
      } else {
        // Enforce required fields on publish
        if (!nameVal || !slugVal) {
          showToast("Name and Slug are required to publish.", "error");
          setSaving(false);
          return;
        }
      }

      const payload = { 
        ...productModal, 
        name: nameVal,
        slug: slugVal,
        category: catVal,
        siteId: brandId,
        enabled: isDraftOnly ? false : (productModal.enabled !== false)
      };

      let saved: Product;
      if (productModal.id) {
        saved = await AdminProductAPI.update(productModal.id, payload);
        showToast(isDraftOnly ? "Draft progress saved to database!" : "Product updated & published successfully!", "success");
      } else {
        saved = await AdminProductAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved to database!" : "Product created & published successfully!", "success");
      }
      
      // Successful database save: clear local draft caching
      if (typeof window !== "undefined") {
        const draftKey = "prism_product_draft_" + (productModal.id || "new");
        localStorage.removeItem(draftKey);
        localStorage.removeItem("prism_product_draft_new");
      }
      
      if (isDraftOnly) {
        setProductModal(saved);
      } else {
        setProductModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save product", "error");
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
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Blog post updated successfully!", "success");
      } else {
        saved = await AdminBlogAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Blog post created successfully!", "success");
      }
      if (isDraftOnly) {
        setBlogModal(saved);
      } else {
        setBlogModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save blog post", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveFaq(isDraftOnly: boolean) {
    if (!faqModal) return;
    if (!isDraftOnly && (!faqModal.productIds || faqModal.productIds.length === 0)) {
      showToast("Please select at least one Related Product/Tool", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...faqModal, siteId: brandId };
      let saved: FAQ;
      if (faqModal.id) {
        saved = await AdminFaqAPI.update(faqModal.id, payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "FAQ updated successfully!", "success");
      } else {
        saved = await AdminFaqAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "FAQ created successfully!", "success");
      }
      if (isDraftOnly) {
        setFaqModal(saved);
      } else {
        setFaqModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save FAQ", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(isDraftOnly: boolean) {
    if (!categoryModal) return;
    if (!isDraftOnly && (!categoryModal.productIds || categoryModal.productIds.length === 0)) {
      showToast("Please select at least one Related Product/Tool", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...categoryModal, siteId: brandId };
      let saved: Category;
      if (categoryModal.id) {
        saved = await AdminCategoryAPI.update(categoryModal.id, payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Category updated successfully!", "success");
      } else {
        saved = await AdminCategoryAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Category created successfully!", "success");
      }
      if (isDraftOnly) {
        setCategoryModal(saved);
      } else {
        setCategoryModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveHelpArticle(isDraftOnly: boolean) {
    if (!helpModal) return;
    if (!isDraftOnly && (!helpModal.productIds || helpModal.productIds.length === 0)) {
      showToast("Please select at least one Related Product/Tool", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...helpModal, siteId: brandId };
      let saved: HelpArticle;
      if (helpModal.id) {
        saved = await AdminHelpAPI.update(helpModal.id, payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Guide article updated successfully!", "success");
      } else {
        saved = await AdminHelpAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Guide article created successfully!", "success");
      }
      if (isDraftOnly) {
        setHelpModal(saved);
      } else {
        setHelpModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save guide article", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveJob(isDraftOnly: boolean) {
    if (!jobModal) return;
    try {
      setSaving(true);
      const payload = { ...jobModal, siteId: brandId };
      let saved: CareerPosition;
      if (jobModal.id) {
        saved = await AdminCareerAPI.update(jobModal.id, payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Job posting updated successfully!", "success");
      } else {
        saved = await AdminCareerAPI.create(payload);
        showToast(isDraftOnly ? "Draft progress saved successfully!" : "Job posting created successfully!", "success");
      }
      if (isDraftOnly) {
        setJobModal(saved);
      } else {
        setJobModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save job posting", "error");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {activeTab === "products" ? "Product Manager" : activeTab === "blogs" ? "Blog Manager" : activeTab === "faqs" ? "FAQ Manager" : activeTab === "categories" ? "Category Manager" : activeTab === "help" ? "Guide Manager" : "Career Manager"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Manage storefront {activeTab === "help" ? "guides" : activeTab === "jobs" ? "open positions" : activeTab} under brand scope:{" "}
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
              {brandId}
            </span>
          </p>
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
            if (activeTab === "products") {
              setProductModal(emptyProduct());
              setModalSubTab("basic");
            } else if (activeTab === "blogs") {
              setBlogModal({ title: "", slug: "", content: "", excerpt: "", author: { name: "", role: "" }, readTime: 5, category: "email-migration" });
            } else if (activeTab === "faqs") {
              setFaqModal({ question: "", answer: "", category: "general" });
            } else if (activeTab === "categories") {
              setCategoryModal({ label: "", description: "", icon: "", color: "#6366f1" });
            } else if (activeTab === "help") {
              setHelpModal({ title: "", slug: "", excerpt: "", content: "", category: "getting-started", tags: [] });
            } else if (activeTab === "jobs") {
              setJobModal({ title: "", department: "", location: "Remote", type: "Full-Time", experience: "", salaryRange: "", description: "", requirements: "", status: "OPEN" });
            }
          }}
          size="sm"
          className="h-9 px-4 gap-1.5 shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add {activeTab === "products" ? "Product" : activeTab === "blogs" ? "Blog" : activeTab === "faqs" ? "FAQ" : activeTab === "categories" ? "Category" : activeTab === "help" ? "Guide" : "Position"}
        </Button>
      </div>

      {/* MODALS */}
      {productModal && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    if (typeof window !== "undefined") {
                      const draftKey = "prism_product_draft_" + (productModal.id || "new");
                      localStorage.removeItem(draftKey);
                      localStorage.removeItem("prism_product_draft_new");
                    }
                    setProductModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {productModal.id ? `Editing Product: ${productModal.name}` : "Create New Product"}
              </h2>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                productModal.enabled !== false 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
              )}>
                {productModal.enabled !== false ? "Published" : "Draft"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-3 select-none">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Listed on Storefront:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productModal.enabled !== false} 
                    onChange={e => setProductModal({ ...productModal, enabled: e.target.checked })} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              <span className="hidden md:inline text-[10px] text-zinc-400 dark:text-zinc-500 italic mr-2 select-none">
                ✓ Auto-saved locally
              </span>

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
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    if (typeof window !== "undefined") {
                      const draftKey = "prism_product_draft_" + (productModal.id || "new");
                      localStorage.removeItem(draftKey);
                      localStorage.removeItem("prism_product_draft_new");
                    }
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
            <aside className="w-56 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
              {(["basic", "tech", "pricing", "requirements", "howItWorks", "faqs", "reviews", "seo"] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer border-0 bg-transparent",
                    modalSubTab === tab
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-150 dark:hover:bg-zinc-900/30"
                  )}
                  onClick={() => setModalSubTab(tab)}
                >
                  {tab === "basic" && "📝 Basic Info"}
                  {tab === "tech" && (
                    <span className="flex items-center justify-between w-full">
                      ⚙️ Specs &amp; Tech
                      {((productModal.sourceFormats?.length ?? 0) > 0 && (productModal.targetFormats?.length ?? 0) > 0) && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">Wizard</span>
                      )}
                    </span>
                  )}
                  {tab === "pricing" && "💵 Pricing Tiers"}
                  {tab === "requirements" && "💻 System"}
                  {tab === "howItWorks" && "🔄 How It Works"}
                  {tab === "faqs" && "❓ FAQs"}
                  {tab === "reviews" && "★ Reviews"}
                  {tab === "seo" && "🔍 SEO Settings"}
                </button>
              ))}
            </aside>

            {/* Right Editing Canvas */}
            <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-950">
              <form onSubmit={handleSaveProduct} className="max-w-3xl mx-auto">
                {hasLocalDraft && (
                  <div className="mb-6 p-4 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-655 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">📝</span>
                      <span>We found an unsaved local draft with newer changes. Would you like to restore it?</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            const draftKey = "prism_product_draft_" + (productModal?.id || "new");
                            const savedDraft = localStorage.getItem(draftKey);
                            if (savedDraft) {
                              try {
                                setProductModal(JSON.parse(savedDraft));
                                showToast("Unsaved changes restored!", "success");
                              } catch {}
                            }
                          }
                          setHasLocalDraft(false);
                          setIsDraftChecked(true);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-705 text-white rounded-lg font-bold border-0 cursor-pointer transition-colors"
                      >
                        Restore Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            const draftKey = "prism_product_draft_" + (productModal?.id || "new");
                            localStorage.removeItem(draftKey);
                          }
                          setHasLocalDraft(false);
                          setIsDraftChecked(true);
                          showToast("Local changes discarded.", "error");
                        }}
                        className="px-3 py-1.5 bg-transparent hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-lg font-bold cursor-pointer transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}
                {/* TAB 1: BASIC INFO */}
                {modalSubTab === "basic" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Permanent Product ID</label>
                        <Input 
                          type="text" 
                          value={productModal.id || "PRM-[CATEGORY]-[YEAR]-[SEQUENCE] (Generated automatically on Publish)"} 
                          disabled 
                          className="bg-zinc-100 dark:bg-zinc-900/50 font-mono text-xs cursor-not-allowed select-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Product Name</label>
                        <Input type="text" value={productModal.name || ""} onChange={e => setProductModal({...productModal, name: e.target.value})} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Slug</label>
                        <Input type="text" value={productModal.slug || ""} onChange={e => setProductModal({...productModal, slug: e.target.value})} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Price ($) - Fallback</label>
                        <Input type="number" step="0.01" value={productModal.price || 0} onChange={e => setProductModal({...productModal, price: parseFloat(e.target.value)})} required />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Category</label>
                          <button
                            type="button"
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline border-0 bg-transparent cursor-pointer"
                            onClick={() => setShowInlineCategoryForm(!showInlineCategoryForm)}
                          >
                            {showInlineCategoryForm ? "✕ Cancel" : "＋ New Category"}
                          </button>
                        </div>
                        
                        {!showInlineCategoryForm ? (
                          <Select 
                            value={productModal.category || ""} 
                            onChange={e => setProductModal({...productModal, category: e.target.value})} 
                            required 
                          >
                            <option value="" disabled>Select a Category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </Select>
                        ) : (
                          <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
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
                                className="w-9 h-9 p-0 border-0 cursor-pointer rounded bg-zinc-150 dark:bg-zinc-800"
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
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Version</label>
                        <Input type="text" value={productModal.version || ""} onChange={e => setProductModal({...productModal, version: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Badge</label>
                        <Select value={productModal.badge || ""} onChange={e => setProductModal({...productModal, badge: (e.target.value || undefined) as any})}>
                          <option value="">No Badge</option>
                          <option value="bestseller">🏆 Bestseller</option>
                          <option value="new">✨ New</option>
                          <option value="popular">🔥 Popular</option>
                          <option value="updated">🔄 Updated</option>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Trial Download URL</label>
                        <Input type="text" value={productModal.trialDownloadUrl || ""} onChange={e => setProductModal({...productModal, trialDownloadUrl: e.target.value})} placeholder="e.g. /download/trial?product=pst-converter" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Installation Success URL</label>
                        <Input type="text" value={productModal.installationSuccessUrl || ""} onChange={e => setProductModal({...productModal, installationSuccessUrl: e.target.value})} placeholder="e.g. /thank-you-install" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Uninstallation Success URL</label>
                        <Input type="text" value={productModal.uninstallationSuccessUrl || ""} onChange={e => setProductModal({...productModal, uninstallationSuccessUrl: e.target.value})} placeholder="e.g. /goodbye" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Short Description</label>
                        <Input type="text" value={productModal.shortDescription || ""} onChange={e => setProductModal({...productModal, shortDescription: e.target.value})} required />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Long Description (HTML Support)</label>
                          <HTMLToolbar 
                            value={productModal.description || ""} 
                            onChange={val => setProductModal({ ...productModal, description: val })} 
                            textareaId="product-description" 
                          />
                        </div>
                        <textarea 
                          id="product-description" 
                          rows={8} 
                          value={productModal.description || ""} 
                          onChange={e => setProductModal({...productModal, description: e.target.value})} 
                          required 
                        />
                      </div>
                      {/* DYNAMIC CONDITIONAL FIELDS */}
                      {(() => {
                        const activeConditionalFields = Object.entries(CATEGORY_CONDITIONAL_FIELDS)
                          .filter(([pattern]) => (productModal.category || "").toLowerCase().includes(pattern))
                          .flatMap(([_, fields]) => fields);
                          
                        if (activeConditionalFields.length === 0) return null;
                        
                        return (
                          <div className="sm:col-span-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4 mt-2">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category-Specific Settings</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {activeConditionalFields.map(field => {
                                if (field.type === "toggle") {
                                  const checked = !!(productModal.capabilities || {})[field.key];
                                  return (
                                    <div key={field.key} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/85 bg-white dark:bg-zinc-900/40">
                                      <div>
                                        <label className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">{field.label}</label>
                                        {field.description && <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{field.description}</p>}
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={e => {
                                            const newCaps = { ...(productModal.capabilities || {}), [field.key]: e.target.checked };
                                            setProductModal({ ...productModal, capabilities: newCaps });
                                          }}
                                          className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                                      </label>
                                    </div>
                                  );
                                }
                                
                                if (field.type === "select") {
                                  const selectedOption = field.options?.find(opt => !!(productModal.capabilities || {})[`${field.key}_${opt.replace(/\s+/g, "_")}`]) || field.options?.[0] || "";
                                  return (
                                    <div key={field.key} className="space-y-1.5">
                                      <label className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">{field.label}</label>
                                      {field.description && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">{field.description}</p>}
                                      <Select
                                        value={selectedOption}
                                        onChange={e => {
                                          const nextVal = e.target.value;
                                          const newCaps = { ...(productModal.capabilities || {}) };
                                          field.options?.forEach(opt => {
                                            newCaps[`${field.key}_${opt.replace(/\s+/g, "_")}`] = opt === nextVal;
                                          });
                                          setProductModal({ ...productModal, capabilities: newCaps });
                                        }}
                                      >
                                        {field.options?.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </Select>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 2: TECHNICAL SPECS */}
                {modalSubTab === "tech" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Features List (Type and press Enter)</label>
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          id="new-feature-input" 
                          placeholder="Add a product feature..." 
                          className="flex-1"
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                const currentFeatures = productModal.features || [];
                                setProductModal({ ...productModal, features: [...currentFeatures, val] });
                                (e.target as HTMLInputElement).value = "";
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
                              input.value = "";
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(productModal.features || []).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-905 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs">
                            <span className="text-zinc-700 dark:text-zinc-300">{feat}</span>
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
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Supported Platforms</label>
                      <div className="flex gap-4">
                        {["Windows", "macOS", "Linux"].map(platform => {
                          const checked = (productModal.platforms || []).includes(platform);
                          return (
                            <label key={platform} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={checked}
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
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

                    {/* Supported Clients */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Supported Clients</label>
                      {supportedClientsRegistry.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No supported clients defined in registry.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                          {supportedClientsRegistry.map(sc => {
                            const isSelected = (productModal.tags || []).includes(sc.key);
                            return (
                              <button
                                type="button"
                                key={sc.key}
                                onClick={() => {
                                  const current = productModal.tags || [];
                                  const next = isSelected ? current.filter(x => x !== sc.key) : [...current, sc.key];
                                  setProductModal({ ...productModal, tags: next });
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                                  isSelected 
                                    ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-750"
                                )}
                              >
                                {sc.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Supported Formats (comma-separated)</label>
                      <Input 
                        type="text" 
                        value={(productModal.supportedFormats || []).join(", ")}
                        onChange={e => {
                          const arr = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
                          setProductModal({ ...productModal, supportedFormats: arr });
                        }}
                        placeholder="e.g. PST, OST, EML, MSG, MBOX"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Related Products</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {products.filter(p => p.id !== productModal.id).map(p => {
                          const checked = (productModal.relatedProductIds || []).includes(p.id!);
                          return (
                            <label key={p.id} className="flex items-center gap-2 p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-xs cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={checked}
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
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

                    {/* ─── Find Your Tool Wizard Settings ─────────────────────────────────── */}
                    <div className="space-y-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Find Your Tool — Wizard Settings
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Products with Source + Target formats appear in the storefront wizard matcher.
                          </p>
                        </div>
                        {/* Live wizard eligibility badge */}
                        {(productModal.sourceFormats?.length ?? 0) > 0 && (productModal.targetFormats?.length ?? 0) > 0 ? (
                          <span className="shrink-0 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                            ✓ In Wizard
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                            ⚠ Not in Wizard
                          </span>
                        )}
                      </div>

                      {/* Source Formats */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Source Formats <span className="text-zinc-400 font-normal">(select what formats this tool converts FROM)</span>
                        </label>
                        {sourceFormatsRegistry.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic">No source formats defined in registry.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                            {sourceFormatsRegistry.map(sf => {
                              const isSelected = (productModal.sourceFormats || []).includes(sf.key);
                              return (
                                <button
                                  type="button"
                                  key={sf.key}
                                  onClick={() => {
                                    const current = productModal.sourceFormats || [];
                                    const next = isSelected ? current.filter(x => x !== sf.key) : [...current, sf.key];
                                    setProductModal({ ...productModal, sourceFormats: next });
                                  }}
                                  className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                                    isSelected 
                                      ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-750"
                                  )}
                                >
                                  {sf.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Target Formats */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Target Formats <span className="text-zinc-400 font-normal">(select what formats this tool converts TO)</span>
                        </label>
                        {targetFormatsRegistry.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic">No target formats defined in registry.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                            {targetFormatsRegistry.map(tf => {
                              const isSelected = (productModal.targetFormats || []).includes(tf.key);
                              return (
                                <button
                                  type="button"
                                  key={tf.key}
                                  onClick={() => {
                                    const current = productModal.targetFormats || [];
                                    const next = isSelected ? current.filter(x => x !== tf.key) : [...current, tf.key];
                                    setProductModal({ ...productModal, targetFormats: next });
                                  }}
                                  className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                                    isSelected 
                                      ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-750"
                                  )}
                                >
                                  {tf.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Capabilities */}
                      {(() => {
                        const isImapSelected = (productModal.sourceFormats || []).some(f => ["gmail", "office365", "exchange_online", "imap"].includes(f)) ||
                                               (productModal.targetFormats || []).some(f => ["gmail", "office365", "exchange_online", "imap"].includes(f));
                        return (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Advanced Capabilities</label>
                            <p className="text-[10px] text-zinc-450 dark:text-zinc-400">Enable features supported by this product to dynamically filter queries in the quiz step.</p>
                            {keyFeaturesRegistry.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic">No key features defined in registry.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {keyFeaturesRegistry.map(kf => {
                                  const key = kf.key;
                                  const label = kf.name;
                                  
                                  // Conditional rendering: if key is Batch Mode Support (supportsMultipleAccounts) and IMAP is not selected, hide it
                                  if (key === "supportsMultipleAccounts" && !isImapSelected) {
                                    return null;
                                  }

                                  const caps = productModal.capabilities || {};
                                  const checked = !!caps[key];
                                  return (
                                    <label key={key} className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-xs cursor-pointer select-none hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 shrink-0"
                                        onChange={e => {
                                          const newCaps = { ...(productModal.capabilities || {}), [key]: e.target.checked };
                                          setProductModal({ ...productModal, capabilities: newCaps });
                                        }}
                                      />
                                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}


                {/* TAB 3: PRICING TIERS */}
                {modalSubTab === "pricing" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Configure Tiers</h3>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-dashed"
                        onClick={() => {
                          const current = productModal.pricing || [];
                          setProductModal({
                            ...productModal,
                            pricing: [...current, { name: "New Tier", price: 59.00, originalPrice: 99.00, period: "lifetime", features: ["1 PC License", "Free lifetime support"], cta: "" }]
                          });
                        }}
                      >
                        ＋ Add Tier
                      </Button>
                    </div>

                    {(productModal.pricing || []).map((tier, idx) => (
                      <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tier Name</label>
                            <Input 
                              type="text" 
                              value={tier.name || ""} 
                              onChange={e => {
                                const updated = [...(productModal.pricing || [])];
                                updated[idx] = { ...tier, name: e.target.value };
                                setProductModal({ ...productModal, pricing: updated });
                              }} 
                              required 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Price ($)</label>
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Original Price ($)</label>
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Billing Period</label>
                            <Select 
                              value={tier.period || "lifetime"} 
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Devices / Mailboxes Limit</label>
                            <Input 
                              type="text" 
                              value={tier.mailboxes || ""} 
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
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-750 dark:bg-zinc-900"
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Custom Purchase/CTA URL</label>
                            <Input 
                              type="text" 
                              value={tier.cta || ""} 
                              onChange={e => {
                                const updated = [...(productModal.pricing || [])];
                                updated[idx] = { ...tier, cta: e.target.value };
                                setProductModal({ ...productModal, pricing: updated });
                              }} 
                              placeholder="Leave blank for dynamic storefront checkout link"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Features (one per line)</label>
                            <textarea 
                              rows={3} 
                              value={(tier.features || []).join("\n")} 
                              onChange={e => {
                                const updated = [...(productModal.pricing || [])];
                                updated[idx] = { ...tier, features: e.target.value.split("\n").map(x => x.trim()).filter(Boolean) };
                                setProductModal({ ...productModal, pricing: updated });
                              }} 
                              required 
                              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* TAB 4: SYSTEM REQUIREMENTS */}
                {modalSubTab === "requirements" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Operating System Requirements</label>
                        <Input 
                          type="text" 
                          value={productModal.systemRequirements?.os || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            systemRequirements: { ...(productModal.systemRequirements || { os: "", processor: "", ram: "", disk: "" }), os: e.target.value }
                          })} 
                          placeholder="e.g. Windows 11, 10, 8, 7" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Processor Requirements</label>
                        <Input 
                          type="text" 
                          value={productModal.systemRequirements?.processor || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            systemRequirements: { ...(productModal.systemRequirements || { os: "", processor: "", ram: "", disk: "" }), processor: e.target.value }
                          })} 
                          placeholder="e.g. 1 GHz CPU" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">RAM Requirements</label>
                        <Input 
                          type="text" 
                          value={productModal.systemRequirements?.ram || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            systemRequirements: { ...(productModal.systemRequirements || { os: "", processor: "", ram: "", disk: "" }), ram: e.target.value }
                          })} 
                          placeholder="e.g. 2 GB RAM" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Disk Space Requirements</label>
                        <Input 
                          type="text" 
                          value={productModal.systemRequirements?.disk || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            systemRequirements: { ...(productModal.systemRequirements || { os: "", processor: "", ram: "", disk: "" }), disk: e.target.value }
                          })} 
                          placeholder="e.g. 100 MB free space" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: HOW IT WORKS */}
                {modalSubTab === "howItWorks" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Workflow Steps</h3>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-dashed"
                        onClick={() => {
                          const current = productModal.howItWorks || [];
                          setProductModal({
                            ...productModal,
                            howItWorks: [...current, { step: current.length + 1, title: "New Step", description: "" }]
                          });
                        }}
                      >
                        ＋ Add Step
                      </Button>
                    </div>

                    {(productModal.howItWorks || []).map((step, idx) => (
                      <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Step Title</label>
                            <Input 
                              type="text" 
                              value={step.title || ""} 
                              onChange={e => {
                                const updated = [...(productModal.howItWorks || [])];
                                updated[idx] = { ...step, title: e.target.value };
                                setProductModal({ ...productModal, howItWorks: updated });
                              }} 
                              required 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Step Number</label>
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
                            <div className="flex justify-between items-center mb-0.5">
                              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Step Description</label>
                              <HTMLToolbar 
                                value={step.description || ""} 
                                onChange={val => {
                                  const updated = [...(productModal.howItWorks || [])];
                                  updated[idx] = { ...step, description: val };
                                  setProductModal({ ...productModal, howItWorks: updated });
                                }} 
                                textareaId={`step-description-${idx}`} 
                              />
                            </div>
                            <textarea 
                              id={`step-description-${idx}`}
                              rows={2} 
                              value={step.description || ""} 
                              onChange={e => {
                                const updated = [...(productModal.howItWorks || [])];
                                updated[idx] = { ...step, description: e.target.value };
                                setProductModal({ ...productModal, howItWorks: updated });
                              }} 
                              required 
                              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* TAB 6: FAQS */}
                {modalSubTab === "faqs" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Product FAQs</h3>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-dashed"
                        onClick={() => {
                          const current = productModal.faqs || [];
                          setProductModal({
                            ...productModal,
                            faqs: [...current, { question: "", answer: "" }]
                          });
                        }}
                      >
                        ＋ Add FAQ
                      </Button>
                    </div>

                    {(productModal.faqs || []).map((faq, idx) => (
                      <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Question</label>
                            <Input 
                              type="text" 
                              value={faq.question || ""} 
                              onChange={e => {
                                const updated = [...(productModal.faqs || [])];
                                updated[idx] = { ...faq, question: e.target.value };
                                setProductModal({ ...productModal, faqs: updated });
                              }} 
                              required 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center mb-0.5">
                              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Answer (HTML support)</label>
                              <HTMLToolbar 
                                value={faq.answer || ""} 
                                onChange={val => {
                                  const updated = [...(productModal.faqs || [])];
                                  updated[idx] = { ...faq, answer: val };
                                  setProductModal({ ...productModal, faqs: updated });
                                }} 
                                textareaId={`faq-answer-${idx}`} 
                              />
                            </div>
                            <textarea 
                              id={`faq-answer-${idx}`}
                              rows={3} 
                              value={faq.answer || ""} 
                              onChange={e => {
                                const updated = [...(productModal.faqs || [])];
                                updated[idx] = { ...faq, answer: e.target.value };
                                setProductModal({ ...productModal, faqs: updated });
                              }} 
                              required 
                              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* TAB 7: REVIEWS */}
                {modalSubTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Product Reviews</h3>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-dashed"
                        onClick={() => {
                          const current = productModal.reviews || [];
                          setProductModal({
                            ...productModal,
                            reviews: [...current, { id: "rev-" + Date.now(), author: "", rating: 5, date: new Date().toISOString().split('T')[0], content: "", role: "", company: "" }]
                          });
                        }}
                      >
                        ＋ Add Review
                      </Button>
                    </div>

                    {(productModal.reviews || []).map((review, idx) => (
                      <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Author</label>
                            <Input 
                              type="text" 
                              value={review.author || ""} 
                              onChange={e => {
                                const updated = [...(productModal.reviews || [])];
                                updated[idx] = { ...review, author: e.target.value };
                                setProductModal({ ...productModal, reviews: updated });
                              }} 
                              required 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rating (1-5)</label>
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
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Author Role</label>
                            <Input 
                              type="text" 
                              value={review.role || ""} 
                              onChange={e => {
                                const updated = [...(productModal.reviews || [])];
                                updated[idx] = { ...review, role: e.target.value };
                                setProductModal({ ...productModal, reviews: updated });
                              }} 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Author Company</label>
                            <Input 
                              type="text" 
                              value={review.company || ""} 
                              onChange={e => {
                                const updated = [...(productModal.reviews || [])];
                                updated[idx] = { ...review, company: e.target.value };
                                setProductModal({ ...productModal, reviews: updated });
                              }} 
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Review Content</label>
                            <textarea 
                              rows={2} 
                              value={review.content || ""} 
                              onChange={e => {
                                const updated = [...(productModal.reviews || [])];
                                updated[idx] = { ...review, content: e.target.value };
                                setProductModal({ ...productModal, reviews: updated });
                              }} 
                              required 
                              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* TAB 8: SEO METADATA */}
                {modalSubTab === "seo" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">SEO Meta Title</label>
                        <Input 
                          type="text" 
                          value={productModal.seo?.title || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            seo: { ...(productModal.seo || { title: "", description: "", keywords: [] }), title: e.target.value }
                          })} 
                          placeholder="SEO optimized title..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">SEO Meta Description</label>
                        <textarea 
                          rows={3} 
                          value={productModal.seo?.description || ""} 
                          onChange={e => setProductModal({
                            ...productModal,
                            seo: { ...(productModal.seo || { title: "", description: "", keywords: [] }), description: e.target.value }
                          })} 
                          placeholder="Brief search summary..."
                          className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">SEO Keywords (comma separated)</label>
                        <Input 
                          type="text" 
                          value={(productModal.seo?.keywords || []).join(", ")} 
                          onChange={e => {
                            const keywordsArray = e.target.value.split(",").map(k => k.trim()).filter(Boolean);
                            setProductModal({
                              ...productModal,
                              seo: { ...(productModal.seo || { title: "", description: "", keywords: [] }), keywords: keywordsArray }
                            });
                          }} 
                          placeholder="e.g. pst converter, outlook migration"
                        />
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
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setBlogModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {blogModal.id ? `Editing Blog Post: ${blogModal.title}` : "Create Blog Post"}
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
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
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

          <div className="flex flex-1 overflow-hidden justify-center bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white dark:bg-zinc-900/50 border-x border-zinc-200 dark:border-zinc-850">
              <form onSubmit={e => { e.preventDefault(); saveBlog(false); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Blog Title</label>
                    <Input type="text" value={blogModal.title || ""} onChange={e => setBlogModal({...blogModal, title: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Slug</label>
                    <Input type="text" value={blogModal.slug || ""} onChange={e => setBlogModal({...blogModal, slug: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Author Name</label>
                    <Input type="text" value={blogModal.author?.name || ""} onChange={e => setBlogModal({...blogModal, author: { name: e.target.value, role: "Author" }})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Read Time (minutes)</label>
                    <Input type="number" value={blogModal.readTime || 0} onChange={e => setBlogModal({...blogModal, readTime: parseInt(e.target.value) || 0})} placeholder="e.g. 5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Category</label>
                    <Input type="text" value={blogModal.category || ""} onChange={e => setBlogModal({...blogModal, category: e.target.value as any})} />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Excerpt</label>
                    <Input type="text" value={blogModal.excerpt || ""} onChange={e => setBlogModal({...blogModal, excerpt: e.target.value})} required />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Content (HTML Support)</label>
                      <HTMLToolbar 
                        value={blogModal.content || ""} 
                        onChange={val => setBlogModal({ ...blogModal, content: val })} 
                        textareaId="blog-content" 
                      />
                    </div>
                    <textarea 
                      id="blog-content" 
                      rows={12} 
                      value={blogModal.content || ""} 
                      onChange={e => setBlogModal({...blogModal, content: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Related Products/Tools</label>
                    <ProductMultiSelect
                      products={products}
                      selectedIds={(blogModal as any).productIds || []}
                      onChange={(updated) => {
                        setBlogModal({ ...blogModal, productIds: updated } as any);
                      }}
                    />
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {faqModal && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setFaqModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {faqModal.id ? "Editing FAQ" : "Create FAQ"}
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
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
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

          <div className="flex flex-1 overflow-hidden justify-center bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white dark:bg-zinc-900/50 border-x border-zinc-200 dark:border-zinc-850">
              <form onSubmit={e => { e.preventDefault(); saveFaq(false); }} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Question</label>
                    <Input type="text" value={faqModal.question || ""} onChange={e => setFaqModal({...faqModal, question: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Answer</label>
                    <textarea 
                      rows={5} 
                      value={faqModal.answer || ""} 
                      onChange={e => setFaqModal({...faqModal, answer: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Category</label>
                    <Input type="text" value={faqModal.category || ""} onChange={e => setFaqModal({...faqModal, category: e.target.value as any})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Related Products/Tools</label>
                    <ProductMultiSelect
                      products={products}
                      selectedIds={faqModal.productIds || []}
                      onChange={(updated, addedId) => {
                        const nextState: any = { ...faqModal, productIds: updated };
                        if (addedId) {
                          const p = products.find(prod => prod.id === addedId);
                          if (p && p.category) {
                            nextState.category = p.category;
                          }
                        }
                        setFaqModal(nextState);
                      }}
                    />
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {helpModal && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setHelpModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {helpModal.id ? `Editing Guide: ${helpModal.title}` : "Create Guide Article"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => saveHelpArticle(true)}
              >
                Save Draft
              </Button>
              <Button 
                size="sm"
                disabled={saving}
                onClick={() => saveHelpArticle(false)}
              >
                Save & Exit
              </Button>
              <button 
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setHelpModal(null);
                  }
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden justify-center bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white dark:bg-zinc-900/50 border-x border-zinc-200 dark:border-zinc-850">
              <form onSubmit={e => { e.preventDefault(); saveHelpArticle(false); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Guide Title</label>
                    <Input 
                      type="text" 
                      value={helpModal.title || ""} 
                      onChange={e => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setHelpModal({
                          ...helpModal,
                          title,
                          slug: helpModal.id ? helpModal.slug : slug
                        });
                      }} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">URL Slug</label>
                    <Input 
                      type="text" 
                      value={helpModal.slug || ""} 
                      onChange={e => setHelpModal({...helpModal, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, "")})} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Category</label>
                    <Select 
                      value={helpModal.category || "getting-started"} 
                      onChange={e => setHelpModal({...helpModal, category: e.target.value as HelpCategory})}
                    >
                      <option value="getting-started">Getting Started</option>
                      <option value="installation">Installation</option>
                      <option value="migration">Migration Guides</option>
                      <option value="troubleshooting">Troubleshooting</option>
                      <option value="licensing">Licensing</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tags (Comma-separated)</label>
                    <Input 
                      type="text" 
                      value={helpModal.tags?.join(", ") || ""} 
                      onChange={e => setHelpModal({...helpModal, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})} 
                      placeholder="e.g. migration, office-365, troubleshoot"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Related Products/Tools</label>
                    <ProductMultiSelect
                      products={products}
                      selectedIds={helpModal.productIds || []}
                      onChange={(updated, addedId) => {
                        const nextState: any = { ...helpModal, productIds: updated };
                        if (addedId) {
                          const p = products.find(prod => prod.id === addedId);
                          if (p && p.category) {
                            const prodCat = p.category.toLowerCase();
                            if (prodCat.includes("migration")) {
                              nextState.category = "migration";
                            } else if (prodCat.includes("recovery")) {
                              nextState.category = "troubleshooting";
                            } else {
                              nextState.category = "getting-started";
                            }
                          }
                        }
                        setHelpModal(nextState);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Excerpt / Short Summary</label>
                    <textarea 
                      rows={2} 
                      value={helpModal.excerpt || ""} 
                      onChange={e => setHelpModal({...helpModal, excerpt: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Content (Markdown / HTML)</label>
                      <HTMLToolbar 
                        value={helpModal.content || ""} 
                        onChange={val => setHelpModal({...helpModal, content: val})} 
                        textareaId="help-content-editor" 
                      />
                    </div>
                    <textarea 
                      id="help-content-editor"
                      rows={12} 
                      value={helpModal.content || ""} 
                      onChange={e => setHelpModal({...helpModal, content: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {jobModal && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setJobModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {jobModal.id ? `Editing Position: ${jobModal.title}` : "Create Open Position"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => saveJob(true)}
              >
                Save Draft
              </Button>
              <Button 
                size="sm"
                disabled={saving}
                onClick={() => saveJob(false)}
              >
                Save & Exit
              </Button>
              <button 
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setJobModal(null);
                  }
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden justify-center bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white dark:bg-zinc-900/50 border-x border-zinc-200 dark:border-zinc-850">
              <form onSubmit={e => { e.preventDefault(); saveJob(false); }} className="space-y-6">
                
                {/* Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">📋 Basic Job Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Job Title</label>
                      <Input 
                        type="text" 
                        value={jobModal.title || ""} 
                        onChange={e => setJobModal({...jobModal, title: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Department</label>
                      <Input 
                        type="text" 
                        value={jobModal.department || ""} 
                        onChange={e => setJobModal({...jobModal, department: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Location</label>
                      <Input 
                        type="text" 
                        value={jobModal.location || ""} 
                        onChange={e => setJobModal({...jobModal, location: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Job Type</label>
                      <Select 
                        value={jobModal.type || "Full-Time"} 
                        onChange={e => setJobModal({...jobModal, type: e.target.value})}
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status</label>
                      <Select 
                        value={jobModal.status || "OPEN"} 
                        onChange={e => setJobModal({...jobModal, status: e.target.value as any})}
                      >
                        <option value="OPEN">OPEN / Accepting Applications</option>
                        <option value="CLOSED">CLOSED / Not Accepting</option>
                        <option value="ARCHIVED">ARCHIVED / Hidden</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Experience Level</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. Mid-Senior (3-5 years)"
                        value={jobModal.experience || ""} 
                        onChange={e => setJobModal({...jobModal, experience: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Salary Range</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. $90k - $120k"
                        value={jobModal.salaryRange || ""} 
                        onChange={e => setJobModal({...jobModal, salaryRange: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Job Content Description & Requirements */}
                <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">📝 Job Description & Requirements</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Short Description</label>
                    <textarea 
                      rows={3} 
                      value={jobModal.description || ""} 
                      onChange={e => setJobModal({...jobModal, description: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Requirements & Details (Markdown / Text)</label>
                    <textarea 
                      rows={6} 
                      value={jobModal.requirements || ""} 
                      onChange={e => setJobModal({...jobModal, requirements: e.target.value})} 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* SEO Configurations */}
                <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">🔍 SEO Configurations (Optional Overrides)</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Meta Title</label>
                    <Input 
                      type="text" 
                      placeholder="Custom job title for search results..."
                      value={jobModal.metaTitle || ""} 
                      onChange={e => setJobModal({...jobModal, metaTitle: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Meta Description</label>
                    <textarea 
                      rows={2} 
                      placeholder="Custom summary of the posting..."
                      value={jobModal.metaDescription || ""} 
                      onChange={e => setJobModal({...jobModal, metaDescription: e.target.value})} 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Meta Keywords</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. jobs, engineering, remote work"
                      value={jobModal.metaKeywords || ""} 
                      onChange={e => setJobModal({...jobModal, metaKeywords: e.target.value})} 
                    />
                  </div>
                </div>

              </form>
            </main>
          </div>
        </div>
      )}

      {categoryModal && (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-4">
              <span 
                className="text-xl font-bold cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none" 
                onClick={() => {
                  if (confirm("Any unsaved changes will be lost. Exit?")) {
                    setCategoryModal(null);
                  }
                }} 
                title="Exit Workspace"
              >
                ←
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {categoryModal.id ? `Editing Category: ${categoryModal.label}` : "Create Category"}
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
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-150 p-1.5 transition-colors border-0 bg-transparent cursor-pointer" 
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

          <div className="flex flex-1 overflow-hidden justify-center bg-zinc-50 dark:bg-zinc-950">
            <main className="flex-1 max-w-3xl p-8 overflow-y-auto bg-white dark:bg-zinc-900/50 border-x border-zinc-200 dark:border-zinc-850">
              <form onSubmit={e => { e.preventDefault(); saveCategory(false); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Category Label</label>
                    <Input type="text" value={categoryModal.label || ""} onChange={e => setCategoryModal({...categoryModal, label: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Color (Hex)</label>
                    <div className="flex gap-2 items-center">
                      <Input type="text" value={categoryModal.color || "#6366f1"} onChange={e => setCategoryModal({...categoryModal, color: e.target.value})} required />
                      <input 
                        type="color" 
                        className="w-10 h-9 p-0 border-0 cursor-pointer rounded-lg bg-zinc-100 dark:bg-zinc-850"
                        value={categoryModal.color || "#6366f1"}
                        onChange={e => setCategoryModal({...categoryModal, color: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Icon Identifier</label>
                    <Input type="text" value={categoryModal.icon || ""} onChange={e => setCategoryModal({...categoryModal, icon: e.target.value})} placeholder="e.g. database" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Description</label>
                    <textarea 
                      rows={3} 
                      value={categoryModal.description || ""} 
                      onChange={e => setCategoryModal({...categoryModal, description: e.target.value})} 
                      required 
                      className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Related Products/Tools</label>
                    <ProductMultiSelect
                      products={products}
                      selectedIds={categoryModal.productIds || []}
                      onChange={(updated) => {
                        setCategoryModal({ ...categoryModal, productIds: updated });
                      }}
                    />
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* TABLES */}
      <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-850">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/12"></div>
            </div>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex justify-between items-center py-4 border-b border-zinc-100 dark:border-zinc-850 last:border-0">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/6"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "products" && (
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
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{p.name}</span>
                            {p.id && p.id.startsWith("PRM-") && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {p.id}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-405 dark:text-zinc-500 font-mono">/{p.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">{p.category}</span>
                      </TableCell>
                      <TableCell className="font-medium">${(p.price ?? 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <button 
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider transition-all cursor-pointer bg-transparent",
                            p.enabled !== false 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                          )}
                          onClick={async () => {
                            try {
                              const updated = { ...p, enabled: p.enabled === false };
                              await AdminProductAPI.update(p.id, updated);
                              showToast(`Product ${updated.enabled ? "enabled" : "disabled"} successfully`, "success");
                              loadData();
                            } catch {
                              showToast("Failed to toggle product status", "error");
                            }
                          }}
                          title="Click to toggle active status on storefront"
                        >
                          {p.enabled !== false ? "Active" : "Disabled"}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{p.version || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.badge ? (
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">{p.badge}</span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600">—</span>
                          )}
                          {(p.sourceFormats?.length ?? 0) > 0 && (p.targetFormats?.length ?? 0) > 0 && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold" title="This product appears in the Find Your Tool wizard">🔍 Wizard</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setQuickLinksModal(p)}>🔗 Links</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setProductModal(p); setModalSubTab("basic"); }}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteProduct(p.id!, p.name)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "blogs" && (
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
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150">
                        <div className="flex flex-col">
                          <span className="font-semibold">{b.title}</span>
                          <span className="text-[11px] text-zinc-405 dark:text-zinc-500 font-mono">/{b.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-zinc-700 dark:text-zinc-300">{b.author?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">{b.category}</span>
                      </TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">{b.readTime || "—"} min</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setBlogModal(b)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteBlog(b.id!, b.title)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "faqs" && (
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
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150" style={{ width: "30%" }}>
                        <div className="flex flex-col gap-1">
                          <span>{f.question}</span>
                          <div className="flex flex-wrap gap-1">
                            {f.productNames && f.productNames.map(name => (
                              <span key={name} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                📦 {name}
                              </span>
                            ))}
                            {!f.productNames && (f as any).productName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                📦 {(f as any).productName}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs max-w-[350px] truncate">{f.answer}</TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">{f.category}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setFaqModal(f)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteFaq(f.id!)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "categories" && (
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
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150">
                        <div className="flex flex-col gap-1">
                          <span>{c.label}</span>
                          <div className="flex flex-wrap gap-1">
                            {c.productNames && c.productNames.map(name => (
                              <span key={name} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                📦 {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: c.color }} />
                          <code className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{c.color}</code>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400"><code>{c.icon}</code></TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm truncate">{c.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setCategoryModal(c)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteCategory(c.id!, c.label)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "help" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Excerpt</TableHead>
                    <TableHead>Helpful Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {helpArticles.filter(h => h.title.toLowerCase().includes(search.toLowerCase()) || h.excerpt?.toLowerCase().includes(search.toLowerCase())).map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-semibold">{h.title}</span>
                            <div className="flex flex-wrap gap-1">
                              {h.productNames && h.productNames.map(name => (
                                <span key={name} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                  📦 {name}
                                </span>
                              ))}
                              {!h.productNames && (h as any).productName && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                  📦 {(h as any).productName}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-405 dark:text-zinc-500 font-mono">/{h.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">
                          {HELP_CATEGORY_LABELS[h.category as HelpCategory] || h.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs max-w-xs truncate">{h.excerpt || "—"}</TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        👍 {h.helpful || 0} / 👎 {h.notHelpful || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setHelpModal(h)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteHelpArticle(h.id!, h.title)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "jobs" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase())).map(j => (
                    <TableRow key={j.id}>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-150">
                        <div className="flex flex-col">
                          <span className="font-semibold">{j.title}</span>
                          {j.experience && <span className="text-[11px] text-zinc-400 font-medium">{j.experience}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{j.department}</TableCell>
                      <TableCell>{j.location}</TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">
                          {j.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold border",
                          j.status === "OPEN" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                          j.status === "CLOSED" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
                          "bg-zinc-500/10 border-zinc-500/20 text-zinc-500 dark:text-zinc-400"
                        )}>
                          {j.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setJobModal(j)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30" onClick={() => handleDeleteJob(j.id!, j.title)}>Delete</Button>
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
          <Card className="w-full max-w-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
              <div className="space-y-1">
                <CardTitle>🔗 Quick Product Links</CardTitle>
                <CardDescription>Copy target URLs for <strong>{quickLinksModal.name}</strong>.</CardDescription>
              </div>
              <button className="text-zinc-405 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold border-0 bg-transparent cursor-pointer" onClick={() => setQuickLinksModal(null)}>✕</button>
            </CardHeader>
            <CardContent className="py-4 space-y-3 max-h-[450px] overflow-y-auto">
              <p className="italic text-xs text-zinc-500 dark:text-zinc-400">
                Configure URL root: <code>{siteUrl}</code>
              </p>
              {[
                { label: "Home Page", url: siteUrl },
                { label: "Product Page", url: `${siteUrl}/products/${quickLinksModal.slug}` },
                { label: "Buy Page", url: `${siteUrl}/products/${quickLinksModal.slug}/buy` },
                { label: "User Guide Page", url: `${siteUrl}/products/${quickLinksModal.slug}/guide` },
                { label: "Support Page", url: `${siteUrl}/support` },
                { label: "Upgrade Page", url: `${siteUrl}/upgrade` },
                { label: "License Activation API", url: `${API_BASE}/license/activate` },
                { label: "FAQ Section Anchor", url: `${siteUrl}/products/${quickLinksModal.slug}#faq` },
                { label: "Privacy Policy", url: `${siteUrl}/privacy-policy` },
                { label: "Terms of Service", url: `${siteUrl}/terms-of-service` },
                { label: "Refund Policy", url: `${siteUrl}/refund-policy` }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-36 shrink-0">{item.label}</span>
                  <span className="text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 px-2 py-1 rounded truncate flex-1" title={item.url}>{item.url}</span>
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
                    {copiedLink === item.label ? "Copied!" : "Copy"}
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
