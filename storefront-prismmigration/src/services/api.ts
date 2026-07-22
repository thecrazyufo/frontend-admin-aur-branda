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

// ─── Public API helpers ────────────────────────────────────────────────────────

const SITE_ID =
  (typeof process !== "undefined" ? (process.env.PUBLIC_SITE_ID || process.env.SITE_ID) : undefined) ||
  import.meta.env.PUBLIC_SITE_ID ||
  import.meta.env.SITE_ID ||
  "default";

export async function apiGet<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${sep}siteId=${SITE_ID}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Admin API helpers (JWT auth) ─────────────────────────────────────────────

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_jwt");
}

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function adminPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function adminDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(`Admin API Error: ${res.status} ${res.statusText}`);
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

export const SettingsAPI = {
  get: () => apiGet<any>("/settings"),
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
