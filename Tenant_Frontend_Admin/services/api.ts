import { Product } from "@/types/product";
import { BlogPost } from "@/types/blog";
import { FAQ } from "@/types/faq";
import { HelpArticle, CareerPosition } from "@/types/common";
import { LicenseKey, DesktopLicense } from "@/types/license";
import { SourceFormat, TargetFormat, SupportedClient, KeyFeature } from "@/types/registry";


export interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  siteId: string;
  productIds?: string[];
  productNames?: string[];
}

export const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window === "undefined") {
    return "http://localhost:8080/api";
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8080/api";
  }

  if (hostname.startsWith("admin.")) {
    return `${protocol}//${hostname.replace(/^admin\./, "api.")}/api`;
  }

  return `${protocol}//api.${hostname}/api`;
})();

// Helper to generate a correlation ID
function getCorrelationId(): string {
  if (typeof window !== "undefined") {
    // Check if session storage has one, or generate a transient request ID
    return "req-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);
  }
  return "srv-" + Math.random().toString(36).substring(2, 11);
}

// ─── Public API helpers (no auth) ────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[API CLIENT GET] [Trace: ${cid}] Fetching: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-ID": cid
      },
      next: { revalidate: 10 },
    });
    console.log(`[API CLIENT GET] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[API CLIENT GET ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[API CLIENT POST] [Trace: ${cid}] Fetching: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-ID": cid
      },
      body: JSON.stringify(body),
    });
    console.log(`[API CLIENT POST] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[API CLIENT POST ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

// ─── Admin API helpers (JWT auth) ─────────────────────────────────────────────

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_jwt");
}

function adminHeaders(correlationId: string): Record<string, string> {
  const token = getAdminToken();
  const siteId = getSelectedSiteId();
  return {
    "Content-Type": "application/json",
    "X-Tenant-ID": siteId,
    "siteId": siteId,
    "X-Correlation-ID": correlationId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getSelectedSiteId(): string {
  if (typeof window === "undefined") return "";
  let siteId = localStorage.getItem("admin_site_id");
  if (!siteId) {
    const role = localStorage.getItem("admin_role");
    if (role === "SUPER_ADMIN" || role === "OWNER") {
      siteId = "brandA";
      localStorage.setItem("admin_site_id", "brandA");
    } else {
      // Attempt to redirect to brand portal instead of falling back to a hardcoded brand
      window.location.href = "/";
      throw new Error("No active brand selected.");
    }
  }
  return siteId;
}

// Log auth expiry context
function handleAuthExpiry() {
  console.warn("[AUTH EXPIRY] Token expired or invalid, cleaning admin storage credentials");
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_jwt");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_token_expiry");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_brand_id");
    document.cookie = "admin_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/admin/login";
  }
}

export async function adminGet<T>(path: string): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  const siteId = getSelectedSiteId();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${siteId}`;
  
  console.log(`[ADMIN CLIENT GET] [Trace: ${cid}] Fetching: ${url} (Tenant: ${siteId})`);
  try {
    const res = await fetch(url, {
      headers: adminHeaders(cid),
      cache: "no-store",
    });
    console.log(`[ADMIN CLIENT GET] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.status === 401) {
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (res.status === 403) {
      const errText = await res.text().catch(() => "");
      console.error(`[ADMIN CLIENT GET FORBIDDEN] [Trace: ${cid}] Access denied to ${url}. Server message: ${errText}`);
      handleAuthExpiry();
      throw new Error(`Admin API Error: 403 Forbidden - ${errText}`);
    }
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error: any) {
    console.error(`[ADMIN CLIENT GET ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, error.message || error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      handleAuthExpiry();
    }
    throw error;
  }
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  const siteId = getSelectedSiteId();
  const payload = typeof body === "object" && body !== null ? { ...body, siteId } : body;

  console.log(`[ADMIN CLIENT POST] [Trace: ${cid}] Posting: ${API_BASE}${path} (Tenant: ${siteId})`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: adminHeaders(cid),
      body: JSON.stringify(payload),
    });
    console.log(`[ADMIN CLIENT POST] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.status === 401) {
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (res.status === 403) {
      console.error(`[ADMIN CLIENT POST FORBIDDEN] [Trace: ${cid}] Access denied to ${path}`);
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error: any) {
    console.error(`[ADMIN CLIENT POST ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, error.message || error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      handleAuthExpiry();
    }
    throw error;
  }
}

export async function adminPut<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  const siteId = getSelectedSiteId();
  const payload = typeof body === "object" && body !== null ? { ...body, siteId } : body;

  console.log(`[ADMIN CLIENT PUT] [Trace: ${cid}] Putting: ${API_BASE}${path} (Tenant: ${siteId})`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: adminHeaders(cid),
      body: JSON.stringify(payload),
    });
    console.log(`[ADMIN CLIENT PUT] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.status === 401) {
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (res.status === 403) {
      console.error(`[ADMIN CLIENT PUT FORBIDDEN] [Trace: ${cid}] Access denied to ${path}`);
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error: any) {
    console.error(`[ADMIN CLIENT PUT ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, error.message || error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      handleAuthExpiry();
    }
    throw error;
  }
}

export async function adminDelete(path: string): Promise<void> {
  const cid = getCorrelationId();
  const start = Date.now();
  const siteId = getSelectedSiteId();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${siteId}`;

  console.log(`[ADMIN CLIENT DELETE] [Trace: ${cid}] Deleting: ${url} (Tenant: ${siteId})`);
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: adminHeaders(cid),
    });
    console.log(`[ADMIN CLIENT DELETE] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.status === 401) {
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (res.status === 403) {
      console.error(`[ADMIN CLIENT DELETE FORBIDDEN] [Trace: ${cid}] Access denied to ${url}`);
      handleAuthExpiry();
      throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    }
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
  } catch (error: any) {
    console.error(`[ADMIN CLIENT DELETE ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, error.message || error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      handleAuthExpiry();
    }
    throw error;
  }
}

// ─── Public APIs ──────────────────────────────────────────────────────────────

export const BrandAPI = {
  getActiveBrands: () => apiGet<any[]>("/brands"),
};

export const CategoryAPI = {
  getAll: () => apiGet<Category[]>("/categories"),
};

export const ProductAPI = {
  getAll: (category?: string, q?: string) => {
    let url = "/products";
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (q) params.append("q", q);
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;
    return apiGet<Product[]>(url);
  },
  getBySlug: (slug: string) => apiGet<Product>(`/products/${slug}`),
  getRelated: (id: string) => apiGet<Product[]>(`/products/${id}/related`),
};

export const BlogAPI = {
  getAll: (category?: string) => {
    const url = category ? `/blog?category=${category}` : "/blog";
    return apiGet<BlogPost[]>(url);
  },
  getBySlug: (slug: string) => apiGet<BlogPost>(`/blog/${slug}`),
};

export const HelpAPI = {
  getAll: (q?: string) => {
    const url = q ? `/help?q=${encodeURIComponent(q)}` : "/help";
    return apiGet<HelpArticle[]>(url);
  },
  getBySlug: (slug: string) => apiGet<HelpArticle>(`/help/${slug}`),
  markHelpful: (id: string) => apiPost<{ helpful: number }>(`/help/${id}/helpful`, {}),
  markNotHelpful: (id: string) => apiPost<{ notHelpful: number }>(`/help/${id}/nothelpful`, {}),
};

export const FaqAPI = {
  getAll: (category?: string) => {
    const url = category ? `/faqs?category=${category}` : "/faqs";
    return apiGet<FAQ[]>(url);
  },
};

export const SupportAPI = {
  submitContact: (body: { name: string; email: string; subject: string; message: string }) =>
    apiPost<{ message: string }>("/support/contact", body),
};

export const DownloadAPI = {
  registerTrial: (body: { email: string; productSlug: string }) =>
    apiPost<{ message: string; downloadUrl: string }>("/download/trial", body),
};

// ─── Admin-only APIs (require JWT) ────────────────────────────────────────────

export const AdminProductAPI = {
  getAll: () => adminGet<Product[]>("/products"),
  create: (product: Partial<Product>) => adminPost<Product>("/products", product),
  update: (id: string, product: Partial<Product>) => adminPut<Product>(`/products/${id}`, product),
  delete: (id: string) => adminDelete(`/products/${id}`),
};

export const AdminBlogAPI = {
  getAll: () => adminGet<BlogPost[]>("/blog"),
  create: (post: Partial<BlogPost>) => adminPost<BlogPost>("/blog", post),
  update: (id: string, post: Partial<BlogPost>) => adminPut<BlogPost>(`/blog/${id}`, post),
  delete: (id: string) => adminDelete(`/blog/${id}`),
};

export const AdminFaqAPI = {
  getAll: () => adminGet<FAQ[]>("/faqs"),
  create: (faq: Partial<FAQ>) => adminPost<FAQ>("/faqs", faq),
  update: (id: string, faq: Partial<FAQ>) => adminPut<FAQ>(`/faqs/${id}`, faq),
  delete: (id: string) => adminDelete(`/faqs/${id}`),
};

export const AdminCategoryAPI = {
  getAll: () => adminGet<Category[]>("/categories?includeEmpty=true"),
  create: (cat: Partial<Category>) => adminPost<Category>("/categories", cat),
  update: (id: string, cat: Partial<Category>) => adminPut<Category>(`/categories/${id}`, cat),
  delete: (id: string) => adminDelete(`/categories/${id}`),
};

export const AdminSettingsAPI = {
  get: () => adminGet<any>("/settings"),
  update: (settings: any) => adminPut<any>("/settings", settings),
};

export const AdminHelpAPI = {
  getAll: () => adminGet<HelpArticle[]>("/help"),
  create: (article: Partial<HelpArticle>) => adminPost<HelpArticle>("/help", article),
  update: (id: string, article: Partial<HelpArticle>) => adminPut<HelpArticle>(`/help/${id}`, article),
  delete: (id: string) => adminDelete(`/help/${id}`),
};

export const AdminCareerAPI = {
  getAll: () => adminGet<CareerPosition[]>("/jobs"),
  create: (job: Partial<CareerPosition>) => adminPost<CareerPosition>("/jobs", job),
  update: (id: string, job: Partial<CareerPosition>) => adminPut<CareerPosition>(`/jobs/${id}`, job),
  delete: (id: string) => adminDelete(`/jobs/${id}`),
};

export const AdminLicenseAPI = {
  getAll: () => adminGet<LicenseKey[]>("/licensing-admin"),
  generate: (data: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    orderId: string;
    maxDevices: number;
    durationMonths: number;
  }) => adminPost<LicenseKey>("/licensing-admin/generate", data),
  revoke: (id: string) => adminPost<LicenseKey>(`/licensing-admin/revoke/${id}`, {}),
  reactivate: (id: string) => adminPost<LicenseKey>(`/licensing-admin/reactivate/${id}`, {}),
  resetActivations: (id: string) => adminPost<LicenseKey>(`/licensing-admin/reset/${id}`, {}),
  resendEmail: (id: string) => adminPost<{ message: string }>(`/licensing-admin/resend/${id}`, {}),
  downloadInvoice: async (orderId: string) => {
    const cid = getCorrelationId();
    const siteId = getSelectedSiteId();
    const url = `${API_BASE}/orders/${orderId}/invoice/pdf?siteId=${siteId}`;
    const token = getAdminToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Tenant-ID": siteId,
        "siteId": siteId,
        "X-Correlation-ID": cid,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });
    if (!response.ok) throw new Error("Failed to download PDF invoice.");
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};

export const AdminDesktopLicenseAPI = {
  getAll: () => adminGet<DesktopLicense[]>("/licensing-admin/desktop"),
  generate: (data: {
    brandPrefix: string;
    licenseType: string;
    maxActivations: number;
    durationMonths: number;
  }) => adminPost<DesktopLicense>("/licensing-admin/desktop/generate", data),
  revoke: (id: number) => adminPost<DesktopLicense>(`/licensing-admin/desktop/revoke/${id}`, {}),
  reactivate: (id: number) => adminPost<DesktopLicense>(`/licensing-admin/desktop/reactivate/${id}`, {}),
  resetActivations: (id: number) => adminPost<DesktopLicense>(`/licensing-admin/desktop/reset/${id}`, {}),
};

export const AuthAPI = {
  login: (username: string, password: string) =>
    apiPost<{ token: string; username: string; expiresIn: number; role: string; brandId: string }>("/auth/login", {
      username,
      password,
    }),
};

export const AdminOwnerAPI = {
  getCredentials: () => adminGet<any[]>("/owner/credentials"),
  saveCredentials: (data: any) => adminPost<any>("/owner/credentials", data),
  deleteCredentials: (username: string) => adminDelete(`/owner/credentials/${username}`),
};

export const AdminSocialProofAPI = {
  getLogos: () => adminGet<any[]>("/social-proof/logos"),
  createLogo: (data: any) => adminPost<any>("/social-proof/logos", data),
  updateLogo: (id: string, data: any) => adminPut<any>(`/social-proof/logos/${id}`, data),
  deleteLogo: (id: string) => adminDelete(`/social-proof/logos/${id}`),

  getTestimonials: () => adminGet<any[]>("/social-proof/testimonials"),
  createTestimonial: (data: any) => adminPost<any>("/social-proof/testimonials", data),
  updateTestimonial: (id: string, data: any) => adminPut<any>(`/social-proof/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => adminDelete(`/social-proof/testimonials/${id}`),
};

export const AdminRegistryAPI = {
  // Source Formats
  getSourceFormats: () => adminGet<SourceFormat[]>("/registry/source-formats"),
  createSourceFormat: (data: Partial<SourceFormat>) => adminPost<SourceFormat>("/registry/source-formats", data),
  updateSourceFormat: (id: string, data: Partial<SourceFormat>) => adminPut<SourceFormat>(`/registry/source-formats/${id}`, data),
  deleteSourceFormat: (id: string) => adminDelete(`/registry/source-formats/${id}`),

  // Target Formats
  getTargetFormats: () => adminGet<TargetFormat[]>("/registry/target-formats"),
  createTargetFormat: (data: Partial<TargetFormat>) => adminPost<TargetFormat>("/registry/target-formats", data),
  updateTargetFormat: (id: string, data: Partial<TargetFormat>) => adminPut<TargetFormat>(`/registry/target-formats/${id}`, data),
  deleteTargetFormat: (id: string) => adminDelete(`/registry/target-formats/${id}`),

  // Supported Clients
  getSupportedClients: () => adminGet<SupportedClient[]>("/registry/supported-clients"),
  createSupportedClient: (data: Partial<SupportedClient>) => adminPost<SupportedClient>("/registry/supported-clients", data),
  updateSupportedClient: (id: string, data: Partial<SupportedClient>) => adminPut<SupportedClient>(`/registry/supported-clients/${id}`, data),
  deleteSupportedClient: (id: string) => adminDelete(`/registry/supported-clients/${id}`),

  // Key Features
  getKeyFeatures: () => adminGet<KeyFeature[]>("/registry/key-features"),
  createKeyFeature: (data: Partial<KeyFeature>) => adminPost<KeyFeature>("/registry/key-features", data),
  updateKeyFeature: (id: string, data: Partial<KeyFeature>) => adminPut<KeyFeature>(`/registry/key-features/${id}`, data),
  deleteKeyFeature: (id: string) => adminDelete(`/registry/key-features/${id}`),
};

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
  expiresAt?: string;
  siteId: string;
}

export const AdminCouponAPI = {
  getAll: () => adminGet<Coupon[]>("/coupons"),
  create: (data: Partial<Coupon>) => adminPost<Coupon>("/coupons", data),
  update: (id: string, data: Partial<Coupon>) => adminPut<Coupon>(`/coupons/${id}`, data),
  delete: (id: string) => adminDelete(`/coupons/${id}`),
};

export interface BrandConfig {
  id: string;
  name: string;
  domain: string;
  adminDomain?: string;
  devPort?: string;
  logoUrl?: string;
  themeColors?: string;
  features?: string;
  layoutTemplate: string;
  active: boolean;
}

export const AdminBrandAPI = {
  getAll: () => adminGet<BrandConfig[]>("/brands"),
  update: (id: string, data: Partial<BrandConfig>) => adminPut<BrandConfig>(`/brands/${id}`, data),
};

export interface BackupFile {
  fileName: string;
  sizeBytes: number;
  lastModified: number;
  formattedDate: string;
}

export async function adminDownloadFile(path: string, fileName: string) {
  const cid = getCorrelationId();
  const siteId = getSelectedSiteId();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${siteId}`;
  
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "X-Tenant-ID": siteId,
    "siteId": siteId,
    "X-Correlation-ID": cid,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Download failed.");
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const AdminBackupAPI = {
  getAll: () => adminGet<BackupFile[]>("/admin/backups"),
  trigger: () => adminPost<{ status: string; fileName?: string; message?: string }>("/admin/backups/trigger", {}),
  delete: (fileName: string) => adminDelete(`/admin/backups/${fileName}`),
  download: (fileName: string) => adminDownloadFile(`/admin/backups/download/${fileName}`, fileName)
};

