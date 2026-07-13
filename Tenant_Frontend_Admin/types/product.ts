export interface PricingTier {
  name: string;
  price: number;
  originalPrice?: number;
  period: "lifetime" | "yearly" | "monthly";
  features: string[];
  cta: string;
  popular?: boolean;
  mailboxes?: string;
  bestFor?: string;
  description?: string;
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
  macOs?: string;
  macProcessor?: string;
  macRam?: string;
  macDisk?: string;
  linuxOs?: string;
  linuxProcessor?: string;
  linuxRam?: string;
  linuxDisk?: string;
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
  version?: string;
  lastUpdated?: string;
  trialDownloadUrl?: string;
  installerUrl?: string;
  installationSuccessUrl?: string;
  uninstallationSuccessUrl?: string;
  features: string[];
  platforms: string[];
  supportedFormats: string[];
  pricing: PricingTier[];
  licenseComparison?: { feature: string; trial: string; personal: string; enterprise: string }[];
  screenshots?: ProductScreenshot[];
  systemRequirements: SystemRequirement;
  howItWorks: HowItWorksStep[];
  faqs: ProductFAQ[];
  reviews: ProductReview[];
  relatedProductIds: string[];
  sourceFormats?: string[];
  targetFormats?: string[];
  capabilities?: Record<string, boolean>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  siteId: string;
  price?: number;
  enabled?: boolean;
}

