import { defineMiddleware } from "astro:middleware";

// backend-api endpoint base URL for SSR (server-side context)
const API_BASE =
  process.env.PUBLIC_API_URL ||
  "http://tenant-backend:8080/api";

const SITE_ID = import.meta.env.PUBLIC_SITE_ID || import.meta.env.SITE_ID || "";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const startTime = Date.now();
  const requestId = "store-page-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);

  // Skip static assets, internal paths, API routes, or file extensions to optimize performance
  if (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return next();
  }

  console.log(`[Astro ROUTE REQUEST] [ID: ${requestId}] [Tenant: ${SITE_ID}] GET ${pathname}`);

  try {
    const redirectStart = Date.now();
    const url = `${API_BASE}/redirects/resolve?path=${encodeURIComponent(pathname)}&siteId=${SITE_ID}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-ID": requestId
      },
      signal: AbortSignal.timeout(1500), // Quick timeout to ensure page rendering isn't blocked
    });

    console.log(`[Astro REDIRECT CHECK] [ID: ${requestId}] Resolved redirects in ${Date.now() - redirectStart}ms (Status: ${res.status})`);

    if (res.ok) {
      const data = await res.json();
      if (data && data.targetPath) {
        const type = data.redirectType === 302 ? 302 : 301;
        console.info(`[Astro REDIRECTING] [ID: ${requestId}] Redirecting ${pathname} -> ${data.targetPath} (${type})`);
        return context.redirect(data.targetPath, type);
      }
    }
  } catch (err) {
    // Fail-safe: log errors but let the request continue to avoid storefront downtime
    console.error(`[Astro REDIRECT ERROR] [ID: ${requestId}] Failed to resolve redirect for ${pathname}:`, err);
  }

  const response = await next();
  response.headers.set("X-Correlation-ID", requestId);
  
  const duration = Date.now() - startTime;
  console.log(`[Astro ROUTE RESPONSE] [ID: ${requestId}] Rendered ${pathname} in ${duration}ms (Status: ${response.status})`);

  return response;
});
