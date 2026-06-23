import { HelpArticle } from "@/types/common";
import { HelpAPI } from "@/services/api";

export async function getHelpArticleBySlug(slug: string): Promise<HelpArticle | undefined> {
  return await HelpAPI.getBySlug(slug);
}

export async function getAllHelpSlugs(): Promise<string[]> {
  const all = await HelpAPI.getAll();
  return all.map((a) => a.slug);
}

export async function getHelpArticlesList(q?: string): Promise<HelpArticle[]> {
  return await HelpAPI.getAll(q);
}
