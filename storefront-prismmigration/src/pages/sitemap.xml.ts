import type { APIRoute } from "astro";
import { SettingsAPI, ProductAPI, BlogAPI, HelpAPI } from "@/services/api";

export const GET: APIRoute = async () => {
  const settings = await SettingsAPI.get().catch(() => null);
  const siteUrl = (settings?.url || "").replace(/\/$/, "");

  // Fetch dynamic entities
  const [products, blogs, helpArticles] = await Promise.all([
    ProductAPI.getAll().catch(() => []),
    BlogAPI.getAll().catch(() => []),
    HelpAPI.getAll().catch(() => []),
  ]);

  type SitemapEntry = {
    url: string;
    lastmod?: string;
    changefreq: string;
    priority: string;
  };

  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split("T")[0];

  // ── Homepage ──────────────────────────────────────────────────────────────
  entries.push({
    url: siteUrl || "https://localhost",
    lastmod: today,
    changefreq: "daily",
    priority: "1.0",
  });

  // ── High-value static pages ───────────────────────────────────────────────
  const highValueRoutes = [
    { path: "/products", priority: "0.9", changefreq: "weekly" },
    { path: "/pricing", priority: "0.8", changefreq: "monthly" },
    { path: "/faq", priority: "0.8", changefreq: "monthly" },
    { path: "/blog", priority: "0.8", changefreq: "weekly" },
  ];
  for (const r of highValueRoutes) {
    entries.push({ url: `${siteUrl}${r.path}`, priority: r.priority, changefreq: r.changefreq });
  }

  // ── Medium-value static pages ─────────────────────────────────────────────
  const mediumRoutes = [
    { path: "/compare", priority: "0.7", changefreq: "monthly" },
    { path: "/help", priority: "0.7", changefreq: "weekly" },
    { path: "/about", priority: "0.6", changefreq: "monthly" },
    { path: "/contact", priority: "0.6", changefreq: "monthly" },
  ];
  for (const r of mediumRoutes) {
    entries.push({ url: `${siteUrl}${r.path}`, priority: r.priority, changefreq: r.changefreq });
  }

  // ── Low-value / policy pages ──────────────────────────────────────────────
  const lowRoutes = [
    { path: "/privacy" },
    { path: "/terms" },
    { path: "/refund" },
    { path: "/license" },
  ];
  for (const r of lowRoutes) {
    entries.push({ url: `${siteUrl}${r.path}`, priority: "0.4", changefreq: "yearly" });
  }

  // NOTE: /search, /download, /checkout intentionally excluded — all noindex

  // ── Product pages ─────────────────────────────────────────────────────────
  for (const product of products) {
    if (product.enabled !== false) {
      entries.push({
        url: `${siteUrl}/products/${product.slug}`,
        lastmod: product.updatedAt?.split("T")[0] || today,
        changefreq: "weekly",
        priority: "0.9",
      });
      // Product sub-pages
      entries.push({
        url: `${siteUrl}/products/${product.slug}/guide`,
        lastmod: product.updatedAt?.split("T")[0] || today,
        changefreq: "monthly",
        priority: "0.7",
      });
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────────
  for (const post of blogs) {
    entries.push({
      url: `${siteUrl}/blog/${post.slug}`,
      lastmod: post.publishedAt?.split("T")[0] || today,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  // ── Help articles ─────────────────────────────────────────────────────────
  for (const article of helpArticles) {
    entries.push({
      url: `${siteUrl}/help/${article.slug}`,
      lastmod: article.updatedAt?.split("T")[0] || today,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
