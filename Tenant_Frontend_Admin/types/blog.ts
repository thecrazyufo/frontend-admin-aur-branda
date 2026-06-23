export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  coverImage: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  siteId: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export type BlogCategory =
  | "email-migration"
  | "backup"
  | "tutorials"
  | "tips-tricks"
  | "news"
  | "comparison";

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  "email-migration": "Email Migration",
  backup: "Backup & Recovery",
  tutorials: "Tutorials",
  "tips-tricks": "Tips & Tricks",
  news: "News & Updates",
  comparison: "Comparisons",
};
