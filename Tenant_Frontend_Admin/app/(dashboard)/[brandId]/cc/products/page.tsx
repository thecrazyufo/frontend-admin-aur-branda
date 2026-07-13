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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-stone-500 font-semibold p-8 animate-pulse">Loading manager...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {

  
  const setBlogs = (v: any | ((prev: any) => any)) => {}; const blogs: any[] = [];
  const setFaqs = (v: any | ((prev: any) => any)) => {}; const faqs: any[] = [];
  const setCategories = (v: any | ((prev: any) => any)) => {}; const categories: any[] = [];
  const setHelpArticles = (v: any | ((prev: any) => any)) => {}; const helpArticles: any[] = [];
  const setJobs = (v: any | ((prev: any) => any)) => {}; const jobs: any[] = [];
  
  const setBlogModal = (v: any) => {}; const blogModal: any = null;
  const setFaqModal = (v: any) => {}; const faqModal: any = null;
  const setCategoryModal = (v: any) => {}; const categoryModal: any = null;
  const showInlineCategoryForm = false; const setShowInlineCategoryForm = (v: any) => {};
  const newCategoryForm: any = null; const setNewCategoryForm = (v: any) => {};
  const newCategorySaving = false; const setNewCategorySaving = (v: any) => {};
  const setHelpModal = (v: any) => {}; const helpModal: any = null;
  const setJobModal = (v: any) => {}; const jobModal: any = null;
  const setActiveTab = (v: any) => {};
  
  // Dummy empty funcs that might be referenced in JSX buttons
  
  
  
  const saveBlog = async (...args: any[]) => {};
  const deleteBlog = async () => {};
  const saveFaq = async (...args: any[]) => {};
  const deleteFaq = async () => {};
  const saveCategory = async (...args: any[]) => {};
  const deleteCategory = async () => {};
  const handleCreateCategoryInline = async () => {};
  const saveHelpArticle = async (...args: any[]) => {};
  const deleteHelpArticle = async () => {};
  const saveJob = async (...args: any[]) => {};
  const deleteJob = async () => {};
  

  const params = useParams();
  const brandId = (params?.brandId as string) || "";
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as Tab | null;

  const activeTab = "products" as string;

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
  const [products, setProducts] = useState<Product[]>([]);
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
  
  const [productModal, _setProductModal] = useState<Partial<Product> | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const prevModalRef = useRef<string | null>(null);

  useEffect(() => {
    const currentStr = productModal ? JSON.stringify(productModal) : null;
    if (!prevModalRef.current && currentStr) {
      setIsDirty(false);
    } else if (prevModalRef.current && currentStr && prevModalRef.current !== currentStr) {
      setIsDirty(true);
    } else if (!currentStr) {
      setIsDirty(false);
    }
    prevModalRef.current = currentStr;
  }, [productModal]);

  const setProductModal = (val: any) => {
    if (val === null && isDirty) {
      if (!window.confirm("You have unsaved changes. Discard?")) return;
    }
    _setProductModal(val);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && productModal) {
        if (isDirty) {
          if (!window.confirm("You have unsaved changes. Discard?")) return;
        }
        _setProductModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [productModal, isDirty]);

    const [modalSubTab, setModalSubTab] = useState<"basic" | "tech" | "pricing" | "comparison" | "requirements" | "howItWorks" | "faqs" | "reviews" | "seo">("basic");
  const [siteUrl, setSiteUrl] = useState("https://www.pstconverter.com");
  const [quickLinksModal, setQuickLinksModal] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
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

  // Auto-sync Fallback Price from lowest pricing tier
  useEffect(() => {
    if (productModal?.pricing && productModal.pricing.length > 0) {
      const prices = productModal.pricing.map((t: any) => t.price).filter((p: any) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : productModal.pricing[0].price;
      if (productModal.price !== minPrice) {
        setProductModal((prev: any) => prev ? { ...prev, price: minPrice } : null);
      }
    }
  }, [productModal?.pricing]);

  // Dynamic inline category states
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
  async function handleAddInlineSource() {
    const val = inlineSourceText.trim();
    if (!val) return;
    const key = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    if (!key) return;

    if (sourceFormatsRegistry.some(x => x.key === key)) {
      showToast("Format already exists in registry!", "error");
      return;
    }

    try {
      const created = await AdminRegistryAPI.createSourceFormat({
        key,
        name: val,
        description: `${val} source format (added inline)`,
        icon: "mail",
        siteId: brandId
      });
      setSourceFormatsRegistry((prev: any) => [...prev, created]);
      const current = productModal?.sourceFormats || [];
      if (productModal) {
        setProductModal({ ...productModal, sourceFormats: [...current, created.key] });
      }
      setInlineSourceText("");
      showToast(`Added ${val} to registry!`, "success");
    } catch {
      showToast("Failed to add format to registry", "error");
    }
  }

  async function handleAddInlineTarget() {
    const val = inlineTargetText.trim();
    if (!val) return;
    const key = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    if (!key) return;

    if (targetFormatsRegistry.some(x => x.key === key)) {
      showToast("Format already exists in registry!", "error");
      return;
    }

    try {
      const created = await AdminRegistryAPI.createTargetFormat({
        key,
        name: val,
        description: `${val} target format (added inline)`,
        icon: "mail",
        siteId: brandId
      });
      setTargetFormatsRegistry((prev: any) => [...prev, created]);
      const current = productModal?.targetFormats || [];
      if (productModal) {
        setProductModal({ ...productModal, targetFormats: [...current, created.key] });
      }
      setInlineTargetText("");
      showToast(`Added ${val} to registry!`, "success");
    } catch {
      showToast("Failed to add format to registry", "error");
    }
  }

  async function handleAddInlineClient() {
    const val = inlineClientText.trim();
    if (!val) return;
    const key = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    if (!key) return;

    if (supportedClientsRegistry.some(x => x.key === key)) {
      showToast("Client already exists in registry!", "error");
      return;
    }

    try {
      const created = await AdminRegistryAPI.createSupportedClient({
        key,
        name: val,
        description: `${val} client (added inline)`,
        icon: "mail",
        siteId: brandId
      });
      setSupportedClientsRegistry((prev: any) => [...prev, created]);
      const current = productModal?.tags || [];
      if (productModal) {
        setProductModal({ ...productModal, tags: [...current, created.key] });
      }
      setInlineClientText("");
      showToast(`Added ${val} to registry!`, "success");
    } catch {
      showToast("Failed to add client to registry", "error");
    }
  }

  async function handleAddInlineFeature() {
    const val = inlineFeatureText.trim();
    if (!val) return;
    const key = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    if (!key) return;

    if (keyFeaturesRegistry.some(x => x.key === key)) {
      showToast("Feature already exists in registry!", "error");
      return;
    }

    try {
      const created = await AdminRegistryAPI.createKeyFeature({
        key,
        name: val,
        description: `${val} feature (added inline)`,
        siteId: brandId
      });
      setKeyFeaturesRegistry((prev: any) => [...prev, created]);
      const caps = productModal?.capabilities || {};
      if (productModal) {
        setProductModal({ ...productModal, capabilities: { ...caps, [created.key]: true } });
      }
      setInlineFeatureText("");
      showToast(`Added ${val} to registry!`, "success");
    } catch {
      showToast("Failed to add feature to registry", "error");
    }
  }

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
        trialDownloadUrl: `/download/trial?product=${slugVal}`,
        installerUrl: productModal.installerUrl || `https://downloads.thecrazyufo.in/installers/${slugVal}-trial.exe`,
        installationSuccessUrl: `/thank-you-install?product=${slugVal}`,
        uninstallationSuccessUrl: `/goodbye?product=${slugVal}`,
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
        setIsDirty(false); setProductModal(null);
      }
      loadData();
    } catch {
      showToast("Failed to save product", "error");
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
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-4">
                {productModal.id ? `Editing Product: ${productModal.name}` : "Create New Product"}
                {!productModal.id && (
                  <select 
                    className="ml-4 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 outline-none text-zinc-700 dark:text-zinc-300 font-medium"
                    onChange={(e) => setProductModal(emptyProduct(e.target.value as any))}
                    defaultValue="email"
                  >
                    <option value="email">Email Migration Template</option>
                    <option value="cloud">Cloud Migration Template</option>
                    <option value="backup">Backup Tool Template</option>
                    <option value="recovery">Recovery Tool Template</option>
                    <option value="blank">Blank Template</option>
                  </select>
                )}
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
              {(["basic", "tech", "pricing", "comparison", "requirements", "howItWorks", "faqs", "reviews", "seo"] as const).map(tab => (
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
                  {tab === "comparison" && "📊 License Comparison"}
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
                        <Input 
                          type="text" 
                          value={productModal.name || ""} 
                          onChange={e => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                            if (!productModal.id) {
                              setProductModal({
                                ...productModal,
                                name,
                                slug,
                                trialDownloadUrl: `/download/trial?product=${slug}`,
                                installerUrl: `https://downloads.thecrazyufo.in/installers/${slug}-trial.exe`,
                                installationSuccessUrl: `/thank-you-install?product=${slug}`,
                                uninstallationSuccessUrl: `/goodbye?product=${slug}`
                              });
                            } else {
                              setProductModal({
                                ...productModal,
                                name
                              });
                            }
                          }} 
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Slug</label>
                        <Input 
                          type="text" 
                          value={productModal.slug || ""} 
                          onChange={e => {
                            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            if (!productModal.id) {
                              setProductModal({
                                ...productModal,
                                slug,
                                trialDownloadUrl: `/download/trial?product=${slug}`,
                                installerUrl: `https://downloads.thecrazyufo.in/installers/${slug}-trial.exe`,
                                installationSuccessUrl: `/thank-you-install?product=${slug}`,
                                uninstallationSuccessUrl: `/goodbye?product=${slug}`
                              });
                            } else {
                              setProductModal({
                                ...productModal,
                                slug
                              });
                            }
                          }} 
                          required 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Price ($) - Fallback <span className="text-[10px] text-zinc-400 font-normal">(Auto-calculated from pricing tiers)</span></label>
                        <Input type="number" step="0.01" value={productModal.price || 0} onChange={e => setProductModal({...productModal, price: parseFloat(e.target.value)})} required disabled className="bg-zinc-100/50 dark:bg-zinc-950/20 cursor-not-allowed" />
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
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Direct EXE Installer URL (Pasted Link)</label>
                        <Input type="text" value={productModal.installerUrl || ""} onChange={e => setProductModal({...productModal, installerUrl: e.target.value})} placeholder="e.g. https://my-storage.com/installers/pst-converter.exe" />
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
                          className="flex min-h-[200px] w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100 resize-y"
                        />
                      </div>
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
                        {(productModal.features || []).map((feat: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-905 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs">
                            <span className="text-zinc-700 dark:text-zinc-300">{feat}</span>
                            <button 
                              type="button" 
                              className="text-zinc-400 hover:text-red-500 font-bold border-0 bg-transparent cursor-pointer"
                              onClick={() => {
                                const filtered = (productModal.features || []).filter((_: any, i: number) => i !== idx);
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
                      <div className="space-y-2">
                        {supportedClientsRegistry.length > 0 ? (
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
                        ) : (
                          <p className="text-xs text-zinc-500 italic px-1">No supported clients defined. Add one below:</p>
                        )}
                        
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Add client (e.g. Outlook, Apple Mail)..."
                            value={inlineClientText}
                            onChange={e => setInlineClientText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddInlineClient(); } }}
                            className="text-xs py-1.5 h-8 flex-1"
                          />
                          <Button 
                            type="button"
                            onClick={handleAddInlineClient}
                            variant="outline"
                            className="px-3 h-8 text-xs font-bold"
                          >
                            + Add
                          </Button>
                        </div>
                      </div>
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
                        <div className="space-y-2">
                                                    {(productModal.sourceFormats && productModal.sourceFormats.length > 0) ? (
                            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                              {productModal.sourceFormats.map(key => {
                                const sf = sourceFormatsRegistry.find(s => s.key === key);
                                return (
                                  <div key={key} className="flex items-center gap-1 bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full text-xs font-medium">
                                    <span>{sf?.name || key}</span>
                                    <button 
                                      type="button"
                                      className="hover:text-indigo-800 dark:hover:text-indigo-200 ml-1 cursor-pointer"
                                      onClick={() => setProductModal({ ...productModal, sourceFormats: productModal.sourceFormats?.filter(x => x !== key) })}
                                    >×</button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500 italic px-1">No source formats selected.</p>
                          )}

                          <div className="flex gap-2">
                            <Input
                              type="text"
                              list="sourceFormatsDatalist"
                              placeholder="Type to search or add source format (e.g. PST)..."
                              value={inlineSourceText}
                              onChange={e => setInlineSourceText(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddInlineSource(); } }}
                              className="text-xs py-1.5 h-8 flex-1"
                            />
                            <datalist id="sourceFormatsDatalist">
                              {sourceFormatsRegistry.map(sf => <option key={sf.key} value={sf.key}>{sf.name}</option>)}
                            </datalist>
                            <Button 
                              type="button"
                              onClick={handleAddInlineSource}
                              variant="outline"
                              className="px-3 h-8 text-xs font-bold"
                            >
                              + Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Target Formats */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Target Formats <span className="text-zinc-400 font-normal">(select what formats this tool converts TO)</span>
                        </label>
                        <div className="space-y-2">
                                                    {(productModal.targetFormats && productModal.targetFormats.length > 0) ? (
                            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                              {productModal.targetFormats.map(key => {
                                const tf = targetFormatsRegistry.find(t => t.key === key);
                                return (
                                  <div key={key} className="flex items-center gap-1 bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full text-xs font-medium">
                                    <span>{tf?.name || key}</span>
                                    <button 
                                      type="button"
                                      className="hover:text-indigo-800 dark:hover:text-indigo-200 ml-1 cursor-pointer"
                                      onClick={() => setProductModal({ ...productModal, targetFormats: productModal.targetFormats?.filter(x => x !== key) })}
                                    >×</button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500 italic px-1">No target formats selected.</p>
                          )}

                          <div className="flex gap-2">
                            <Input
                              type="text"
                              list="targetFormatsDatalist"
                              placeholder="Type to search or add target format (e.g. PDF)..."
                              value={inlineTargetText}
                              onChange={e => setInlineTargetText(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddInlineTarget(); } }}
                              className="text-xs py-1.5 h-8 flex-1"
                            />
                            <datalist id="targetFormatsDatalist">
                              {targetFormatsRegistry.map(tf => <option key={tf.key} value={tf.key}>{tf.name}</option>)}
                            </datalist>
                            <Button 
                              type="button"
                              onClick={handleAddInlineTarget}
                              variant="outline"
                              className="px-3 h-8 text-xs font-bold"
                            >
                              + Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      {(() => {
                        const isImapSelected = (productModal.sourceFormats || []).some(f => ["gmail", "office365", "exchange_online", "imap"].includes(f)) ||
                                               (productModal.targetFormats || []).some(f => ["gmail", "office365", "exchange_online", "imap"].includes(f));
                        return (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Advanced Capabilities</label>
                            <p className="text-[10px] text-zinc-450 dark:text-zinc-400">Enable features supported by this product to dynamically filter queries in the quiz step.</p>
                            <div className="space-y-2">
                              {keyFeaturesRegistry.length > 0 ? (
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
                              ) : (
                                <p className="text-xs text-zinc-500 italic px-1">No capabilities defined. Add one below:</p>
                              )}

                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Add capability (e.g. supportsBatchCsv, supportsImpersonation)..."
                                  value={inlineFeatureText}
                                  onChange={e => setInlineFeatureText(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddInlineFeature(); } }}
                                  className="text-xs py-1.5 h-8 flex-1"
                                />
                                <Button 
                                  type="button"
                                  onClick={handleAddInlineFeature}
                                  variant="outline"
                                  className="px-3 h-8 text-xs font-bold"
                                >
                                  + Add
                                </Button>
                              </div>
                            </div>
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
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Configure Tiers</h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Set up the commercial licenses, price points, and support levels for this product.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => {
                            if ((productModal.pricing?.length ?? 0) > 0) {
                              if (!window.confirm("This will overwrite your current pricing tiers. Continue?")) return;
                            }
                            const templates = [
                              {
                                name: "Single User License",
                                price: 49.00,
                                originalPrice: 69.00,
                                period: "lifetime" as const,
                                bestFor: "Individuals / Personal Use",
                                description: "Perfect for personal use, this license makes email conversion simple, fast, and effortless for individuals.",
                                mailboxes: "Install on 2 PCs",
                                features: [
                                  "Install on 2 PC (System)",
                                  "Personal use only",
                                  "License Validity 1 Year",
                                  "Free updates for 1 Year",
                                  "Email support"
                                ],
                                cta: "",
                                popular: false
                              },
                              {
                                name: "Administrator License",
                                price: 199.00,
                                originalPrice: 249.00,
                                period: "lifetime" as const,
                                bestFor: "Individuals / Small Teams",
                                description: "Designed for small teams and admins, it enables efficient, hassle-free email management for multiple accounts.",
                                mailboxes: "Install on 7 PCs",
                                features: [
                                  "Install on 7 PCs",
                                  "Commercial use allowed",
                                  "License Validity 3 Year",
                                  "Free updates for 3 Year",
                                  "Priority email support"
                                ],
                                cta: "",
                                popular: true
                              },
                              {
                                name: "Technician User License",
                                price: 299.00,
                                originalPrice: 399.00,
                                period: "lifetime" as const,
                                bestFor: "Small (SMBs) / IT Teams",
                                description: "Ideal for SMBs and IT professionals, handle bulk conversions quickly, reliably, and with professional-grade tools.",
                                mailboxes: "Install on 12 PCs",
                                features: [
                                  "Install on 12 PCs",
                                  "Organization-wide license",
                                  "License Validity 5 Year",
                                  "Free updates for 5 Year",
                                  "Priority chat & email support"
                                ],
                                cta: "",
                                popular: false
                              }
                            ];
                            setProductModal({
                              ...productModal,
                              pricing: templates
                            });
                          }}
                        >
                          ⚡ Load Standard Tiers
                        </Button>
                        <Button 
                          type="button" 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const current = productModal.pricing || [];
                            setProductModal({
                              ...productModal,
                              pricing: [...current, { name: "New Tier", price: 59.00, originalPrice: 99.00, period: "lifetime", features: ["1 PC License", "Free lifetime support"], cta: "", bestFor: "", description: "" }]
                            });
                          }}
                        >
                          ＋ Add Custom Tier
                        </Button>
                      </div>
                    </div>

                    {(productModal.pricing || []).map((tier, idx) => (
                      <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tier #{idx + 1}</span>
                          <button 
                            type="button" 
                            className="text-xs font-semibold text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
                            onClick={() => {
                              const filtered = (productModal.pricing || []).filter((_: any, i: number) => i !== idx);
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
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Best For</label>
                            <Input 
                              type="text" 
                              value={tier.bestFor || ""} 
                              onChange={e => {
                                const updated = [...(productModal.pricing || [])];
                                updated[idx] = { ...tier, bestFor: e.target.value };
                                setProductModal({ ...productModal, pricing: updated });
                              }} 
                              placeholder="e.g. Individuals / Personal Use"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Subheading / Description</label>
                            <Input 
                              type="text" 
                              value={tier.description || ""} 
                              onChange={e => {
                                const updated = [...(productModal.pricing || [])];
                                updated[idx] = { ...tier, description: e.target.value };
                                setProductModal({ ...productModal, pricing: updated });
                              }} 
                              placeholder="e.g. Perfect for personal use, this license..."
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

                {/* TAB: LICENSE COMPARISON */}
                {modalSubTab === "comparison" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">License Comparison Matrix</h3>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Configure the feature-by-feature comparison table shown on the storefront product page.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => {
                            const current = productModal.licenseComparison || [];
                            const presets = [
                              { feature: "File Size Limit", trial: "50 MB", personal: "No Limit", enterprise: "No Limit" },
                              { feature: "Batch Conversion", trial: "No", personal: "Yes", enterprise: "Yes" },
                              { feature: "Technical Support", trial: "Email Only", personal: "24/7 Support", enterprise: "Priority 24/7 Support" },
                              { feature: "Commercial Use", trial: "No", personal: "No", enterprise: "Yes" },
                              { feature: "License Validity", trial: "15 Days", personal: "Lifetime", enterprise: "Lifetime" },
                              { feature: "Free Updates", trial: "No", personal: "1 Year", enterprise: "Lifetime" }
                            ];
                            const filteredPresets = presets.filter(p => !current.some(c => c.feature.toLowerCase() === p.feature.toLowerCase()));
                            setProductModal({
                              ...productModal,
                              licenseComparison: [...current, ...filteredPresets]
                            });
                          }}
                        >
                          ⚡ Load Presets
                        </Button>
                        <Button 
                          type="button" 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const current = productModal.licenseComparison || [];
                            setProductModal({
                              ...productModal,
                              licenseComparison: [...current, { feature: "New Feature", trial: "No", personal: "Yes", enterprise: "Yes" }]
                            });
                          }}
                        >
                          ＋ Add Row
                        </Button>
                      </div>
                    </div>

                    {(!productModal.licenseComparison || productModal.licenseComparison.length === 0) ? (
                      <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <span className="text-2xl">📊</span>
                        <p className="text-xs text-zinc-500 font-semibold mt-2">No comparison features defined yet.</p>
                        <p className="text-[10px] text-zinc-400 mt-1 max-w-xs mx-auto">
                          Click "Add Row" or "Load Presets" to create a comparison matrix comparing Trial, Personal, and Enterprise versions.
                        </p>
                      </div>
                    ) : (
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">
                              <th className="p-3 w-5/12">Feature Name</th>
                              <th className="p-3 w-2/12">Trial</th>
                              <th className="p-3 w-2/12">Personal</th>
                              <th className="p-3 w-2/12">Enterprise</th>
                              <th className="p-3 w-1/12 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-xs">
                            {productModal.licenseComparison.map((row: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                                <td className="p-2">
                                  <Input
                                    type="text"
                                    value={row.feature}
                                    onChange={e => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      updated[idx] = { ...row, feature: e.target.value };
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="h-8 text-xs font-semibold"
                                    placeholder="e.g. Free Updates"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="text"
                                    value={row.trial}
                                    onChange={e => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      updated[idx] = { ...row, trial: e.target.value };
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="e.g. No"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="text"
                                    value={row.personal}
                                    onChange={e => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      updated[idx] = { ...row, personal: e.target.value };
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="e.g. Yes"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="text"
                                    value={row.enterprise}
                                    onChange={e => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      updated[idx] = { ...row, enterprise: e.target.value };
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="e.g. Yes"
                                  />
                                </td>
                                <td className="p-2 text-right flex gap-1 justify-end items-center">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="p-1 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-current border-0 bg-transparent cursor-pointer"
                                    title="Move Up"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (productModal.licenseComparison?.length ?? 0) - 1}
                                    onClick={() => {
                                      const updated = [...(productModal.licenseComparison || [])];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="p-1 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-current border-0 bg-transparent cursor-pointer"
                                    title="Move Down"
                                  >
                                    ▼
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (productModal.licenseComparison || []).filter((_: any, i: number) => i !== idx);
                                      setProductModal({ ...productModal, licenseComparison: updated });
                                    }}
                                    className="p-1 text-red-500 hover:text-red-600 border-0 bg-transparent cursor-pointer"
                                    title="Delete Row"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SYSTEM REQUIREMENTS */}
                {modalSubTab === "requirements" && (
                  <div className="space-y-6">
                    {/* Windows */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 p-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">Windows Requirements</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Operating System</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.os || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), os: e.target.value }
                            })} 
                            placeholder="e.g. Windows 11, 10, 8, 7" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Processor</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.processor || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), processor: e.target.value }
                            })} 
                            placeholder="e.g. 1 GHz CPU" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">RAM</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.ram || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), ram: e.target.value }
                            })} 
                            placeholder="e.g. 2 GB RAM" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Disk Space</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.disk || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), disk: e.target.value }
                            })} 
                            placeholder="e.g. 100 MB free space" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* macOS */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 p-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">macOS Requirements</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Operating System</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.macOs || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), macOs: e.target.value }
                            })} 
                            placeholder="e.g. macOS 13 Ventura or newer" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Processor</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.macProcessor || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), macProcessor: e.target.value }
                            })} 
                            placeholder="e.g. Apple Silicon (M1/M2/M3) or Intel Core" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">RAM</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.macRam || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), macRam: e.target.value }
                            })} 
                            placeholder="e.g. 4 GB RAM" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Disk Space</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.macDisk || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), macDisk: e.target.value }
                            })} 
                            placeholder="e.g. 150 MB free space" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Linux */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 p-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">Linux Requirements</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Operating System</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.linuxOs || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), linuxOs: e.target.value }
                            })} 
                            placeholder="e.g. Ubuntu 20.04+, Debian 11+" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Processor</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.linuxProcessor || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), linuxProcessor: e.target.value }
                            })} 
                            placeholder="e.g. Intel/AMD 64-bit CPU" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">RAM</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.linuxRam || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), linuxRam: e.target.value }
                            })} 
                            placeholder="e.g. 2 GB RAM" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Disk Space</label>
                          <Input 
                            type="text" 
                            value={productModal.systemRequirements?.linuxDisk || ""} 
                            onChange={e => setProductModal({
                              ...productModal,
                              systemRequirements: { ...(productModal.systemRequirements || {}), linuxDisk: e.target.value }
                            })} 
                            placeholder="e.g. 100 MB free space" 
                          />
                        </div>
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
                              const filtered = (productModal.howItWorks || []).filter((_: any, i: number) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
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
                              const filtered = (productModal.faqs || []).filter((_: any, i: number) => i !== idx);
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
                              const filtered = (productModal.reviews || []).filter((_: any, i: number) => i !== idx);
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
          </div>
        )}
      </Card>
      {/* QUICK LINKS MODAL */}
    </div>
  );
}
