export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  siteId: string;
  productIds?: string[];
  productNames?: string[];
}

export type FAQCategory =
  | "general"
  | "licensing"
  | "technical"
  | "payment"
  | "download";

export const FAQ_CATEGORY_LABELS: Record<FAQCategory, string> = {
  general: "General",
  licensing: "Licensing",
  technical: "Technical Support",
  payment: "Payment & Billing",
  download: "Download & Install",
};
