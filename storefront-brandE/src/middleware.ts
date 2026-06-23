import { defineMiddleware } from "astro:middleware";

// backend-api endpoint base URL for SSR (server-side context)
const API_BASE =
  process.env.PUBLIC_API_URL ||
  "http://tenant-backend:8080/api";

const SITE_ID = import.meta.env.PUBLIC_SITE_ID || import.meta.env.SITE_ID || "";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip static assets, internal paths, API routes, or file extensions to optimize performance
  if (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return next();
  }

  try {
    const url = `${API_BASE}/redirects/resolve?path=${encodeURIComponent(pathname)}&siteId=${SITE_ID}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(1500), // Quick timeout to ensure page rendering isn't blocked
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.targetPath) {
        const type = data.redirectType === 302 ? 302 : 301;
        return context.redirect(data.targetPath, type);
      }
    }
  } catch (err) {
    // Fail-safe: log errors but let the request continue to avoid storefront downtime
    console.error(`[Middleware Redirect Error] Failed to resolve redirect for ${pathname}:`, err);
  }

  return next();
});
