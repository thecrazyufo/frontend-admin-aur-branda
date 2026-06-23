import type { APIRoute } from "astro";
import { SettingsAPI } from "@/services/api";

export const GET: APIRoute = async () => {
  const settings = await SettingsAPI.get().catch(() => null);
  const robotsTxt = settings?.seoDefaults?.robotsTxt;
  const siteUrl = settings?.url || "";

  const body = robotsTxt || `User-agent: *
Allow: /

Sitemap: ${siteUrl ? siteUrl.replace(/\/$/, "") : "http://localhost:3001"}/sitemap.xml
`;

  return new Response(body.trim() + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
