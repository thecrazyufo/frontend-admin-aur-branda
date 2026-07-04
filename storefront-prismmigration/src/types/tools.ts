import type { Product } from "./product";

export interface FormatOption {
  key: string;
  label: string;
  icon: string;
  description: string;
  vendor: string;
}

export interface AvailableFormatsResponse {
  sourceFormats: FormatOption[];
  targetFormats: FormatOption[];
}

export interface ToolMatchResult {
  product: Product;
  matchType: "PERFECT_MATCH" | "EXACT" | "SIMILAR" | "COMPATIBLE";
  score: number;
  matchReason: string;
}
