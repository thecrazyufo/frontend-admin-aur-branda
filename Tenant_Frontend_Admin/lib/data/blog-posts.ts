import { BlogPost } from "@/types/blog";
import { BlogAPI } from "@/services/api";

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return await BlogAPI.getBySlug(slug);
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  return await BlogAPI.getAll(category);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const all = await BlogAPI.getAll();
  return all.map((p) => p.slug);
}

export async function getBlogPostsList(category?: string): Promise<BlogPost[]> {
  return await BlogAPI.getAll(category);
}


