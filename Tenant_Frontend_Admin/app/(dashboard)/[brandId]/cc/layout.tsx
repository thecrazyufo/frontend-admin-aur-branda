"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  Package, 
  FileText, 
  HelpCircle, 
  Tags, 
  BookOpen, 
  Briefcase,
  Settings,
  Database
} from "lucide-react";

export default function ContentCatalogLayout({ 
  children,
  params
}: { 
  children: ReactNode;
  params: Promise<{ brandId: string }>;
}) {
  const pathname = usePathname();
  const { brandId } = React.use(params);

  const tabs = [
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" />, href: `/${brandId}/cc/products` },
    { id: "blogs", label: "Blogs", icon: <FileText className="w-4 h-4" />, href: `/${brandId}/cc/blogs` },
    { id: "faqs", label: "FAQs", icon: <HelpCircle className="w-4 h-4" />, href: `/${brandId}/cc/faqs` },
    { id: "categories", label: "Categories", icon: <Tags className="w-4 h-4" />, href: `/${brandId}/cc/categories` },
    { id: "help", label: "Help Articles", icon: <BookOpen className="w-4 h-4" />, href: `/${brandId}/cc/help` },
    { id: "careers", label: "Careers", icon: <Briefcase className="w-4 h-4" />, href: `/${brandId}/cc/careers` }
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-50 dark:bg-[#0B0F19]">
      <div className="flex-none p-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Content & Catalog</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage products, blog posts, and site content for {brandId}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${isActive 
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        {children}
      </div>
    </div>
  );
}
