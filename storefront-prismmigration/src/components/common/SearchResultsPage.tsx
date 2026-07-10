import { useState, useEffect } from "react";
import { ProductAPI, BlogAPI, HelpAPI } from "@/services/api";
import type { Product } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import type { HelpArticle } from "@/types/common";
import SearchBar from "@/components/common/SearchBar";
import { Search, Package, BookOpen, FileText, Loader2 } from "lucide-react";

export default function SearchResultsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "blog" | "help">("all");
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [matchedBlog, setMatchedBlog] = useState<BlogPost[]>([]);
  const [matchedHelp, setMatchedHelp] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Read URL search params on mount and on history changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get("q") || "");
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  useEffect(() => {
    if (!q) {
      setMatchedProducts([]);
      setMatchedBlog([]);
      setMatchedHelp([]);
      return;
    }
    
    setLoading(true);
    
    Promise.all([
      ProductAPI.getAll(undefined, q),
      BlogAPI.getAll(),
      HelpAPI.getAll(q)
    ]).then(([pList, bList, hList]) => {
      setMatchedProducts(pList.filter((p) => p.enabled !== false));
      // Filter blog posts on client side
      setMatchedBlog(bList.filter((b) => 
        b.title.toLowerCase().includes(q.toLowerCase()) || 
        b.excerpt.toLowerCase().includes(q.toLowerCase())
      ));
      setMatchedHelp(hList);
      setLoading(false);
    }).catch((err) => {
      console.error("Search fetch failed", err);
      setLoading(false);
    });
  }, [q]);

  const totalResults = matchedProducts.length + matchedBlog.length + matchedHelp.length;

  return (
    <div className="container-custom py-10 max-w-4xl">
      <div className="mb-8">
        <SearchBar size="lg" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 text-[#94A3B8] py-20">
          <Loader2 className="animate-spin text-[#6366F1]" size={32} />
          <p className="text-xs">Searching the database...</p>
        </div>
      ) : q ? (
        <>
          <p className="text-xs text-[#94A3B8] mb-6">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;<strong className="text-white">{q}</strong>&rdquo;
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[#334155]">
            {[
              { key: "all", label: `All (${totalResults})` },
              { key: "products", label: `Products (${matchedProducts.length})` },
              { key: "blog", label: `Blog (${matchedBlog.length})` },
              { key: "help", label: `Help (${matchedHelp.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`pb-3 px-1 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer bg-transparent border-[#334155] ${
                  activeTab === tab.key ? "border-[#6366F1] text-[#6366F1]" : "border-transparent text-[#94A3B8] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Products */}
            {(activeTab === "all" || activeTab === "products") && matchedProducts.map((p) => (
              <a key={p.id} href={`/products/${p.slug}`} className="flex items-start gap-4 bg-[#1E2937]/30 backdrop-blur rounded-xl border border-[#334155] p-5 shadow-2xl hover:border-[#6366F1]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-[#0B0F1A] border border-[#334155] flex items-center justify-center shrink-0 text-[#6366F1]">
                  <Package size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#6366F1]/20 bg-[#6366F1]/10 text-[#6366F1] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Product</span>
                  <h3 className="font-bold text-white group-hover:text-[#6366F1] transition-colors text-sm">{p.name}</h3>
                  <p className="text-xs text-[#E2E8F0] mt-1">{p.shortDescription}</p>
                </div>
              </a>
            ))}

            {/* Blog */}
            {(activeTab === "all" || activeTab === "blog") && matchedBlog.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="flex items-start gap-4 bg-[#1E2937]/30 backdrop-blur rounded-xl border border-[#334155] p-5 shadow-2xl hover:border-[#6366F1]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-[#0B0F1A] border border-[#334155] flex items-center justify-center shrink-0 text-[#6366F1]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#6366F1]/20 bg-[#6366F1]/10 text-[#6366F1] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Blog</span>
                  <h3 className="font-bold text-white group-hover:text-[#6366F1] transition-colors text-sm">{p.title}</h3>
                  <p className="text-xs text-[#E2E8F0] mt-1">{p.excerpt}</p>
                </div>
              </a>
            ))}

            {/* Help */}
            {(activeTab === "all" || activeTab === "help") && matchedHelp.map((a) => (
              <a key={a.id} href={`/help/${a.slug}`} className="flex items-start gap-4 bg-[#1E2937]/30 backdrop-blur rounded-xl border border-[#334155] p-5 shadow-2xl hover:border-[#6366F1]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-[#0B0F1A] border border-[#334155] flex items-center justify-center shrink-0 text-[#6366F1]">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#6366F1]/20 bg-[#6366F1]/10 text-[#6366F1] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Help</span>
                  <h3 className="font-bold text-white group-hover:text-[#6366F1] transition-colors text-sm">{a.title}</h3>
                  <p className="text-xs text-[#E2E8F0] mt-1">{a.excerpt}</p>
                </div>
              </a>
            ))}

            {totalResults === 0 && (
              <div className="text-center py-16">
                <Search size={40} className="text-stone-800 mx-auto mb-4" />
                <p className="text-[#E2E8F0] text-sm">No results found for &ldquo;{q}&rdquo;</p>
                <p className="text-xs text-[#94A3B8] mt-2">Try different keywords or browse our products.</p>
                <a href="/products" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-xs py-2.5 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(99, 102, 241,0.25)] mt-6 inline-block">Browse Products</a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Search size={40} className="text-stone-850 mx-auto mb-4" />
          <p className="text-[#94A3B8] text-xs">Type something to search...</p>
        </div>
      )}
    </div>
  );
}
