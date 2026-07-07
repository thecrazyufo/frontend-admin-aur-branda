export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: HelpCategory;
  tags: string[];
  publishedAt: string;
  helpful?: number;
  notHelpful?: number;
  siteId?: string;
}

export type HelpCategory =
  | "getting-started"
  | "installation"
  | "migration"
  | "troubleshooting"
  | "licensing";

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  "getting-started": "Getting Started",
  installation: "Installation",
  migration: "Migration Guides",
  troubleshooting: "Troubleshooting",
  licensing: "Licensing",
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SearchResult {
  type: "product" | "blog" | "help";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
}

export interface CareerPosition {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience?: string;
  salaryRange?: string;
  description: string;
  requirements?: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  siteId?: string;
}

export interface ClientsPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

