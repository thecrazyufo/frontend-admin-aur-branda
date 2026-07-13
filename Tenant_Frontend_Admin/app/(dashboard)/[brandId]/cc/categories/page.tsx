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

const emptyProduct = (preset: "blank" | "email" | "cloud" | "backup" | "recovery" = "email"): Partial<Product> => {
  const base: Partial<Product> = {
    name: "", slug: "", price: 0, version: "1.0.0", badge: undefined,
    trialDownloadUrl: "", installationSuccessUrl: "", uninstallationSuccessUrl: "",
    description: "", shortDescription: "", features: [], platforms: ["Windows"],
    pricing: [
      { name: "Standard License", price: 49.00, period: "lifetime", features: ["1 User license", "Free 1-year updates", "24/7 technical support"], cta: "" }
    ],
    systemRequirements: { os: "Windows 11/10/8/7 (32/64 bit)", processor: "1 GHz Intel/AMD processor", ram: "2 GB", disk: "100 MB" },
    reviews: [
      { id: "rev-1", author: "John D.", rating: 5, date: new Date().toISOString().split('T')[0], content: "Excellent software, saved me hours of work!", role: "System Administrator", company: "Tech Solutions" }
    ],
    relatedProductIds: [], sourceFormats: [], targetFormats: [], capabilities: {},
    seo: { title: "", description: "", keywords: [] },
    enabled: true
  };

  switch (preset) {
    case "email":
      return {
        ...base,
        category: "email-migration",
        howItWorks: [
          { step: 1, title: "Download & Install", description: "Download the software and install it on your PC." },
          { step: 2, title: "Add Mailbox File", description: "Launch the software and select the mailbox file you want to convert." },
          { step: 3, title: "Select Output", description: "Choose the output format and destination path." },
          { step: 4, title: "Convert & Export", description: "Click Convert to export your mailbox items." }
        ],
        faqs: [
          { question: "Can I convert large mailbox files?", answer: "Yes, our software has no file size limit and can convert large files without data loss." }
        ]
      };
    case "cloud":
      return {
        ...base,
        category: "cloud-migration",
        howItWorks: [
          { step: 1, title: "Connect Source", description: "Authenticate with your source cloud platform." },
          { step: 2, title: "Connect Destination", description: "Authenticate with the destination cloud platform." },
          { step: 3, title: "Map Users", description: "Map source users to destination users." },
          { step: 4, title: "Start Migration", description: "Begin the cloud-to-cloud migration process." }
        ],
        faqs: [
          { question: "Is my data secure?", answer: "Yes, we use OAuth 2.0 and do not store your credentials. Data is encrypted during transit." }
        ]
      };
    case "backup":
      return {
        ...base,
        category: "backup",
        howItWorks: [
          { step: 1, title: "Connect Account", description: "Login to the account you want to backup." },
          { step: 2, title: "Select Folders", description: "Choose specific folders or backup everything." },
          { step: 3, title: "Choose Format", description: "Select the backup file format (e.g., PST, EML, PDF)." },
          { step: 4, title: "Start Backup", description: "Click start to download your backup locally." }
        ],
        faqs: [
          { question: "Can I schedule backups?", answer: "Yes, the software supports automated scheduled backups." }
        ]
      };
    case "recovery":
      return {
        ...base,
        category: "mailbox-recovery",
        howItWorks: [
          { step: 1, title: "Add Corrupt File", description: "Select the damaged or corrupted data file." },
          { step: 2, title: "Scan File", description: "The software will scan and recover deleted or corrupted items." },
          { step: 3, title: "Preview Data", description: "Preview the recovered emails, contacts, and calendars." },
          { step: 4, title: "Save Data", description: "Export the recovered data to a healthy file format." }
        ],
        faqs: [
          { question: "Can it recover permanently deleted emails?", answer: "Yes, the deep scan mode can recover hard-deleted items." }
        ]
      };
    case "blank":
    default:
      return {
        ...base,
        category: "general",
        howItWorks: [],
        faqs: []
      };
  }
};

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

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="text-xs text-stone-500 font-semibold p-8 animate-pulse">Loading manager...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}

function CategoriesContent() {

  const setProducts = (v: any | ((prev: any) => any)) => {}; const products: any[] = [];
  const setBlogs = (v: any | ((prev: any) => any)) => {}; const blogs: any[] = [];
  const setFaqs = (v: any | ((prev: any) => any)) => {}; const faqs: any[] = [];
  
  const setHelpArticles = (v: any | ((prev: any) => any)) => {}; const helpArticles: any[] = [];
  const setJobs = (v: any | ((prev: any) => any)) => {}; const jobs: any[] = [];
  const setProductModal = (v: any) => {}; const productModal: any = null; const setModalSubTab = (v: any) => {}; const modalSubTab = "basic" as string;
  const setBlogModal = (v: any) => {}; const blogModal: any = null;
  const setFaqModal = (v: any) => {}; const faqModal: any = null;
  
  
  
  
  const setHelpModal = (v: any) => {}; const helpModal: any = null;
  const setJobModal = (v: any) => {}; const jobModal: any = null;
  const setActiveTab = (v: any) => {};
  
  // Dummy empty funcs that might be referenced in JSX buttons
  const saveProduct = async (...args: any[]) => {};
  const deleteProduct = async () => {};
  const handleProductImageUpload = async () => {};
  const saveBlog = async (...args: any[]) => {};
  const deleteBlog = async () => {};
  const saveFaq = async (...args: any[]) => {};
  const deleteFaq = async () => {};
  
  
  
  const saveHelpArticle = async (...args: any[]) => {};
  const deleteHelpArticle = async () => {};
  const saveJob = async (...args: any[]) => {};
  const deleteJob = async () => {};
  const emptyProduct = (...args: any[]) => ({});

  const params = useParams();
  const brandId = (params?.brandId as string) || "";
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as Tab | null;

  const activeTab = "categories" as string;

  useEffect(() => {
    if (queryTab) {
      // setActiveTab(queryTab);
    } else {
      // setActiveTab("products");
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceFormatsRegistry, setSourceFormatsRegistry] = useState<SourceFormat[]>([]);
  const [targetFormatsRegistry, setTargetFormatsRegistry] = useState<TargetFormat[]>([]);
  const [supportedClientsRegistry, setSupportedClientsRegistry] = useState<SupportedClient[]>([]);
  const [keyFeaturesRegistry, setKeyFeaturesRegistry] = useState<KeyFeature[]>([]);

  // Inline dynamic inputs
  const [inlineSourceText, setInlineSourceText] = useState("");
  const [inlineTargetText, setInlineTargetText] = useState("");
  const [inlineClientText, setInlineClientText] = useState("");
  const [inlineFeatureText, setInlineFeatureText] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Modals state
  const [siteUrl, setSiteUrl] = useState("https://www.pstconverter.com");
  const [quickLinksModal, setQuickLinksModal] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [categoryModal, setCategoryModal] = useState<Partial<Category> | null>(null);
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
      setCategories((prev: any) => [...prev, savedCat]);
      
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

  // Inline Registry dynamic creators
  // Delete Handlers
  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await AdminProductAPI.delete(id);
      setProducts((prev: any) => prev.filter((x: any) => x.id !== id));
      showToast("Product deleted successfully", "success");
    } catch {
      showToast("Failed to delete product", "error");
    }
  }

  async function handleDeleteBlog(id: string, title: string) {
    if (!confirm(`Delete blog post "${title}"?`)) return;
    try {
      await AdminBlogAPI.delete(id);
      setBlogs((prev: any) => prev.filter((x: any) => x.id !== id));
      showToast("Blog post deleted successfully", "success");
    } catch {
      showToast("Failed to delete blog post", "error");
    }
  }

  async function handleDeleteFaq(id: string) {
    if (!confirm(`Delete this FAQ?`)) return;
    try {
      await AdminFaqAPI.delete(id);
      setFaqs((prev: any) => prev.filter((x: any) => x.id !== id));
      showToast("FAQ deleted successfully", "success");
    } catch {
      showToast("Failed to delete FAQ", "error");
    }
  }

  async function handleDeleteCategory(id: string, label: string) {
    if (!confirm(`Delete category "${label}"?`)) return;
    try {
      await AdminCategoryAPI.delete(id);
      setCategories((prev: any) => prev.filter((x: any) => x.id !== id));
      showToast("Category deleted successfully", "success");
    } catch {
      showToast("Failed to delete category", "error");
    }
  }

  async function handleDeleteHelpArticle(id: string, title: string) {
    if (!confirm(`Delete guide article "${title}"?`)) return;
    try {
      await AdminHelpAPI.delete(id);
      setHelpArticles((prev: any) => prev.filter((x: any) => x.id !== id));
      showToast("Guide article deleted successfully", "success");
    } catch {
      showToast("Failed to delete guide article", "error");
    }
  }

  async function handleDeleteJob(id: string, title: string) {
    if (!confirm(`Delete job posting "${title}"?`)) return;
    try {
      await AdminCareerAPI.delete(id);
      setJobs((prev: any) => prev.filter((x: any) => x.id !== id));
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
                            {c.productNames && c.productNames.map((name: string) => (
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
          </div>
        )}
      </Card>
      {/* QUICK LINKS MODAL */}
    </div>
  );
}
