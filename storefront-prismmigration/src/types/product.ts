export interface PricingTier {
  name: string;
  price: number;
  originalPrice?: number;
  period: "lifetime" | "yearly" | "monthly";
  features: string[];
  cta: string;
  popular?: boolean;
  mailboxes?: string;
}

export interface ProductScreenshot {
  url: string;
  alt: string;
  caption?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  role?: string;
  company?: string;
  rating: number;
  date: string;
  content: string;
  avatar?: string;
}

export interface SystemRequirement {
  os: string;
  processor: string;
  ram: string;
  disk: string;
  other?: string[];
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  downloads: string;
  badge?: "bestseller" | "new" | "popular" | "updated";
  features: string[];
  platforms: string[];
  supportedFormats: string[];
  screenshots: ProductScreenshot[];
  pricing: PricingTier[];
  systemRequirements: SystemRequirement;
  howItWorks: HowItWorksStep[];
  faqs: ProductFAQ[];
  reviews: ProductReview[];
  relatedProductIds: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string | null;
  };
  version: string;
  lastUpdated: string;
  trialDownloadUrl?: string;
  installationSuccessUrl?: string;
  uninstallationSuccessUrl?: string;
  enabled?: boolean;
}

export type ProductCategory =
  | "email-migration"
  | "backup"
  | "file-converter"
  | "cloud-migration"
  | "mailbox-recovery"
  | "data-export";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "email-migration": "Email Migration",
  backup: "Backup Tools",
  "file-converter": "File Converters",
  "cloud-migration": "Cloud Migration",
  "mailbox-recovery": "Mailbox Recovery",
  "data-export": "Data Export/Import",
};
