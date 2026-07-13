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
  sourceFormats?: string[];    // Input formats this tool accepts (e.g. ["pst", "ost"])
  targetFormats?: string[];    // Output/destination formats (e.g. ["gmail", "exchange"])
  capabilities?: Record<string, boolean>; // e.g. {supportsBatchCsv: true}
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
  installerUrl?: string;
  installationSuccessUrl?: string;
  uninstallationSuccessUrl?: string;
  enabled?: boolean;
}

