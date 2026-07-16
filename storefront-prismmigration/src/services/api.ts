import type { Product } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import type { FAQ } from "@/types/faq";
import type { HelpArticle } from "@/types/common";
import type { AvailableFormatsResponse, ToolMatchResult } from "@/types/tools";

export interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

// In Astro SSR pages, we always run server-side -> use Docker internal hostname
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

// --- Public API helpers --------------------------------------------------------

const SITE_ID =
  (typeof process !== "undefined" ? (process.env.PUBLIC_SITE_ID || process.env.SITE_ID) : undefined) ||
  import.meta.env.PUBLIC_SITE_ID ||
  import.meta.env.SITE_ID ||
  "default";

export async function apiGet<T>(path: string): Promise<T> {
  const cid = getCorrelationId();
  const start = Date.now();
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${SITE_ID}&_t=${Date.now()}`;
  
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

// NOTE: Admin helper functions (adminGet, adminPost, adminPut, adminDelete) have been
// removed from the storefront. Admin operations belong in the Admin Panel (Tenant_Frontend_Admin).
// AuthAPI is kept below as it's referenced by the auth.ts service layer.


// --- Public APIs ---------------------------------------------------------------

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
    couponCode?: string;
    needsOfflineSupport?: boolean | string;
  }) => apiPost<any>("/checkout/complete", body),
  createStripeSession: (body: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    siteId: string;
    successUrl: string;
    cancelUrl: string;
    couponCode?: string;
    needsOfflineSupport?: boolean | string;
  }) => apiPost<any>("/checkout/create-stripe-session", body),
  confirmStripe: (body: {
    sessionId: string;
    siteId: string;
    customerEmail?: string;
    productId?: string;
    pricingTierName?: string;
    needsOfflineSupport?: boolean | string;
  }) => apiPost<any>("/checkout/confirm-stripe", body),
  createPaypalOrder: (body: {
    productId: string;
    pricingTierName: string;
    customerEmail: string;
    siteId: string;
    returnUrl: string;
    cancelUrl: string;
    couponCode?: string;
    needsOfflineSupport?: boolean | string;
  }) => apiPost<any>("/checkout/create-paypal-order", body),
  capturePaypalOrder: (body: {
    paypalOrderId: string;
    siteId: string;
    customerEmail?: string;
    productId?: string;
    pricingTierName?: string;
    needsOfflineSupport?: boolean | string;
  }) => apiPost<any>("/checkout/capture-paypal-order", body),
};

export const SettingsAPI = {
  get: () => apiGet<any>("/settings"),
};

export const JobsAPI = {
  getAll: (status?: string) => {
    const url = status ? `/jobs?status=${status}` : "/jobs";
    return apiGet<any[]>(url);
  },
};

export const BrandAPI = {
  getActiveBrands: () => apiGet<any[]>("/brands"),
  getCurrentBrand: async () => {
    const brands = await apiGet<any[]>("/brands");
    return brands.find((b: any) => b.id === SITE_ID) || null;
  }
};



export const SocialProofAPI = {
  getLogos: () => apiGet<any[]>(`/social-proof/logos`),
  getTestimonials: () => apiGet<any[]>(`/social-proof/testimonials`),
};

export const ToolsAPI = {
  /**
   * Fetches ALL formats from the registry for the current site.
   * Note: siteId is automatically appended by apiGet — do NOT embed it in the path.
   */
  getAvailableFormats: () =>
    apiGet<AvailableFormatsResponse>(`/registry/formats/all`),

  /**
   * Finds tools matching a source → target conversion.
   * siteId is automatically appended by apiGet.
   */
  matchTools: (
    source: string,
    destination: string,
    multipleAccounts?: boolean,
    requireBatchCsv?: boolean,
    requireImpersonation?: boolean,
  ) => {
    let url = `/tools/match?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
    if (multipleAccounts !== undefined) url += `&multipleAccounts=${multipleAccounts}`;
    if (requireBatchCsv !== undefined) url += `&requireBatchCsv=${requireBatchCsv}`;
    if (requireImpersonation !== undefined) url += `&requireImpersonation=${requireImpersonation}`;
    return apiGet<ToolMatchResult[]>(url);
  },

  /**
   * Returns the union of capabilities across all products matching a source → target pair.
   * Used to dynamically populate the wizard quiz step.
   * siteId is automatically appended by apiGet — do NOT embed it in the path.
   */
  getCapabilities: (
    source: string,
    destination: string,
  ): Promise<{ availableCapabilities: string[]; capabilityLabels: Record<string, string>; totalMatchingProducts: number }> => {
    const url = `/tools/capabilities?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
    return apiGet(url);
  },
};
