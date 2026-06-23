import { ProductCategory } from "@/types/product";

export interface Category {
  id: ProductCategory;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

import { CategoryAPI } from "@/services/api";

export async function getCategoriesList(): Promise<Category[]> {
  return await CategoryAPI.getAll() as unknown as Category[];
}


