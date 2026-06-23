import { FAQ } from "@/types/faq";
import { FaqAPI } from "@/services/api";

export async function getFaqsList(category?: string): Promise<FAQ[]> {
  return await FaqAPI.getAll(category);
}


