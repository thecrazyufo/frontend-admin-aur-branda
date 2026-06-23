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
