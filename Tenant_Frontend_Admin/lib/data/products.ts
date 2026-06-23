import { Product } from "@/types/product";
import { ProductAPI } from "@/services/api";

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return await ProductAPI.getBySlug(slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return await ProductAPI.getAll(category);
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  return await ProductAPI.getRelated(productId);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const all = await ProductAPI.getAll();
  return all.map((p) => p.slug);
}

export async function getProductsList(category?: string, q?: string): Promise<Product[]> {
  return await ProductAPI.getAll(category, q);
}
