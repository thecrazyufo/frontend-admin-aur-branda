import type { Product } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import type { FAQ } from "@/types/faq";
import type { HelpArticle } from "@/types/common";
import type { LicenseKey } from "@/types/license";

export interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

// In Astro SSR pages, we always run server-side → use Docker internal hostname
// In client React Islands, use localhost
const API_BASE =
  import.meta.env.PUBLIC_API_URL ||
  (typeof window === "undefined"
    ? "http://tenant-backend:8080/api"
    : "http://localhost:8080/api");

// Helper to generate a correlation ID
function getCorrelationId(): string {
  if (typeof window !== "undefined") {
    return "store-req-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);
  }
  return "store-srv-" + Math.random().toString(36).substring(2, 11);
}

// ─── Public API helpers ────────────────────────────────────────────────────────

const SITE_ID =
  (typeof process !== "undefined" ? (process.env.PUBLIC_SITE_ID || process.env.SITE_ID) : undefined) ||
  import.meta.env.PUBLIC_SITE_ID ||
  import.meta.env.SITE_ID ||
  "default";

export async function apiGet<T>(path: string): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${SITE_ID}`;
  
  console.log(`[STORE API GET] [Trace: ${cid}] Fetching: ${url}`);
  try {
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-ID": cid
      },
      signal: AbortSignal.timeout(3000),
    });
    console.log(`[STORE API GET] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[STORE API GET ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  
  console.log(`[STORE API POST] [Trace: ${cid}] Fetching: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-ID": cid
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    console.log(`[STORE API POST] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[STORE API POST ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
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
  return {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminGet<T>(path: string): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[STORE ADMIN GET] [Trace: ${cid}] Fetching: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: adminHeaders(cid),
    });
    console.log(`[STORE ADMIN GET] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[STORE ADMIN GET ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[STORE ADMIN POST] [Trace: ${cid}] Posting: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: adminHeaders(cid),
      body: JSON.stringify(body),
    });
    console.log(`[STORE ADMIN POST] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[STORE ADMIN POST ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

export async function adminPut<T>(path: string, body: unknown): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[STORE ADMIN PUT] [Trace: ${cid}] Putting: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: adminHeaders(cid),
      body: JSON.stringify(body),
    });
    console.log(`[STORE ADMIN PUT] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err: any) {
    console.error(`[STORE ADMIN PUT ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

export async function adminDelete(path: string): Promise<void> {
  const cid = getCorrelationId();
  const start = Date.now();
  console.log(`[STORE ADMIN DELETE] [Trace: ${cid}] Deleting: ${API_BASE}${path}`);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: adminHeaders(cid),
    });
    console.log(`[STORE ADMIN DELETE] [Trace: ${cid}] Status: ${res.status} (${Date.now() - start}ms)`);
    if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
  } catch (err: any) {
    console.error(`[STORE ADMIN DELETE ERROR] [Trace: ${cid}] Failed after ${Date.now() - start}ms:`, err.message || err);
    throw err;
  }
}

// ─── Public APIs ───────────────────────────────────────────────────────────────

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

export const CheckoutAPI = {
  completeCheckout: (body: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    paymentMethod: string;
    siteId: string;
  }) => apiPost<any>("/checkout/complete", body),
  createStripeSession: (body: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    siteId: string;
    successUrl: string;
    cancelUrl: string;
  }) => apiPost<any>("/checkout/create-stripe-session", body),
  confirmStripe: (body: {
    sessionId: string;
    siteId: string;
    customerEmail?: string;
    productId?: string;
    pricingTierName?: string;
  }) => apiPost<any>("/checkout/confirm-stripe", body),
  createPaypalOrder: (body: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    siteId: string;
    returnUrl: string;
    cancelUrl: string;
  }) => apiPost<any>("/checkout/create-paypal-order", body),
  capturePaypalOrder: (body: {
    paypalOrderId: string;
    siteId: string;
    customerEmail?: string;
    productId?: string;
    pricingTierName?: string;
  }) => apiPost<any>("/checkout/capture-paypal-order", body),
};

export const SettingsAPI = {
  get: () => apiGet<any>("/settings"),
};

export const BrandAPI = {
  getActiveBrands: () => apiGet<any[]>("/brands"),
  getCurrentBrand: async () => {
    const brands = await apiGet<any[]>("/brands");
    return brands.find((b: any) => b.id === SITE_ID) || null;
  }
};

// ─── Admin/Licensing APIs (require JWT) ────────────────────────────────────────────

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
};

export const AuthAPI = {
  login: (username: string, password: string) =>
    apiPost<{ token: string; username: string; expiresIn: number }>("/auth/login", {
      username,
      password,
    }),
};

export const SocialProofAPI = {
  getLogos: (siteId: string = SITE_ID) => apiGet<any[]>(`/social-proof/logos?siteId=${siteId}`),
  getTestimonials: (siteId: string = SITE_ID) => apiGet<any[]>(`/social-proof/testimonials?siteId=${siteId}`),
};
