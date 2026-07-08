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

  const staticRoutes = [
    "",
    "/pricing",
    "/compare",
    "/download",
    "/faq",
    "/about",
    "/contact",
    "/search",
    "/products",
    "/blog",
    "/help",
    "/privacy",
    "/terms",
    "/refund",
    "/license",
  ];

  const urls: string[] = [];

  // Add static routes
  for (const route of staticRoutes) {
    urls.push(`${siteUrl}${route}`);
  }

  // Add product routes
  for (const product of products) {
    if (product.enabled !== false) {
      urls.push(`${siteUrl}/products/${product.slug}`);
    }
  }

  // Add blog routes
  for (const post of blogs) {
    urls.push(`${siteUrl}/blog/${post.slug}`);
  }

  // Add help routes
  for (const article of helpArticles) {
    urls.push(`${siteUrl}/help/${article.slug}`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url.endsWith("/") || url === siteUrl ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
