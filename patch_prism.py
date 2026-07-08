import os

index_file = "storefront-prismmigration/src/pages/index.astro"
with open(index_file, "w") as f:
    f.write("""---
import BaseLayout from "@/layouts/BaseLayout.astro";
import { ProductAPI, CategoryAPI, SettingsAPI, BrandAPI, SocialProofAPI } from "@/services/api";

import PrismMigrationHome from "@/components/templates/prismmigration/Home.astro";

// Server-side data fetch
let products = [];
let categories = [];
let settings = null;
let clientLogos = [];
let dynamicTestimonials = [];

try {
  const siteId = import.meta.env.PUBLIC_SITE_ID || "brandA";
  [products, categories, settings, clientLogos, dynamicTestimonials] = await Promise.all([
    ProductAPI.getProducts(siteId).catch(() => []),
    CategoryAPI.getCategories().catch(() => []),
    SettingsAPI.getSettings(siteId).catch(() => null),
    SocialProofAPI.getLogos().catch(() => []),
    SocialProofAPI.getTestimonials().catch(() => [])
  ]);
  const activeProducts = products.filter(p => p.enabled !== false);
  categories = categories.map(cat => ({
    ...cat,
    count: activeProducts.filter(p => p.category === cat.id).length
  }));
} catch (e) {
  // Graceful fallback
}

const featured = products.filter(p => p.enabled !== false).slice(0, 6);
const testimonials = dynamicTestimonials.length > 0 ? dynamicTestimonials : products
  .flatMap(p => p.reviews || [])
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 6);

const templateProps = { products, categories, settings, featured, testimonials, clientLogos };
const siteName = settings?.name || "Prism Migration";
const siteTagline = settings?.tagline || "Enterprise Data Migration";
const siteDescription = settings?.description || "Positive, seamless, and secure data migration software.";
---

<BaseLayout title={`${siteName} — ${siteTagline}`} description={siteDescription}>
  <div 
    class="fixed inset-0 z-[-1] opacity-40 pointer-events-none"
    style={settings?.colors && Object.keys(settings.colors).length > 0 ? {
      background: `linear-gradient(135deg, ${settings.colors.primary}15 0%, ${settings.colors.accent}15 100%)`
    } : {}}
  />
  <PrismMigrationHome {...templateProps} />
</BaseLayout>
""")

css_file = "storefront-prismmigration/src/styles/globals.css"
with open(css_file, "r") as f:
    css_content = f.read()

# Strip out luxury stuff and add the new animations
if "@keyframes slideFlowRight" not in css_content:
    css_content += """

@keyframes popInSuccess {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes floatGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes slideFlowRight {
  0%   { opacity: 0; transform: translateX(0) scale(0.8); }
  15%  { opacity: 1; transform: translateX(15px) scale(1); }
  85%  { opacity: 1; transform: translateX(200px) scale(1); }
  100% { opacity: 0; transform: translateX(250px) scale(0.8); }
}

@utility animate-flow-right {
  animation: slideFlowRight 3s ease-in-out infinite;
}
@utility animate-flow-right-delay-1 {
  animation: slideFlowRight 3s ease-in-out infinite;
  animation-delay: 1s;
}
@utility animate-flow-right-delay-2 {
  animation: slideFlowRight 3s ease-in-out infinite;
  animation-delay: 2s;
}

@utility animate-pop-success {
  animation: popInSuccess 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
  animation-delay: 2.5s; /* Sync with flow end */
}

@utility animate-float {
  animation: floatGentle 4s ease-in-out infinite;
}
"""
    with open(css_file, "w") as f:
        f.write(css_content)

print("Restored Prism Migration index.astro and globals.css animations")
