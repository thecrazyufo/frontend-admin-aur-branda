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
      setMatchedProducts(pList);
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
        <div className="flex flex-col items-center justify-center gap-3 text-stone-400 py-20">
          <Loader2 className="animate-spin text-[#EAB308]" size={32} />
          <p className="text-xs">Searching the database...</p>
        </div>
      ) : q ? (
        <>
          <p className="text-xs text-stone-400 mb-6">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;<strong className="text-white">{q}</strong>&rdquo;
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-stone-900">
            {[
              { key: "all", label: `All (${totalResults})` },
              { key: "products", label: `Products (${matchedProducts.length})` },
              { key: "blog", label: `Blog (${matchedBlog.length})` },
              { key: "help", label: `Help (${matchedHelp.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`pb-3 px-1 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === tab.key ? "border-[#EAB308] text-[#EAB308]" : "border-transparent text-stone-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Products */}
            {(activeTab === "all" || activeTab === "products") && matchedProducts.map((p) => (
              <a key={p.id} href={`/products/${p.slug}`} className="flex items-start gap-4 bg-stone-900/30 backdrop-blur rounded-xl border border-stone-900 p-5 shadow-2xl hover:border-[#EAB308]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-850 flex items-center justify-center shrink-0 text-[#EAB308]">
                  <Package size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#EAB308]/20 bg-[#EAB308]/10 text-[#EAB308] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Product</span>
                  <h3 className="font-bold text-white group-hover:text-[#EAB308] transition-colors text-sm">{p.name}</h3>
                  <p className="text-xs text-stone-300 mt-1">{p.shortDescription}</p>
                </div>
              </a>
            ))}

            {/* Blog */}
            {(activeTab === "all" || activeTab === "blog") && matchedBlog.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="flex items-start gap-4 bg-stone-900/30 backdrop-blur rounded-xl border border-stone-900 p-5 shadow-2xl hover:border-[#EAB308]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-850 flex items-center justify-center shrink-0 text-[#EAB308]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#EAB308]/20 bg-[#EAB308]/10 text-[#EAB308] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Blog</span>
                  <h3 className="font-bold text-white group-hover:text-[#EAB308] transition-colors text-sm">{p.title}</h3>
                  <p className="text-xs text-stone-300 mt-1">{p.excerpt}</p>
                </div>
              </a>
            ))}

            {/* Help */}
            {(activeTab === "all" || activeTab === "help") && matchedHelp.map((a) => (
              <a key={a.id} href={`/help/${a.slug}`} className="flex items-start gap-4 bg-stone-900/30 backdrop-blur rounded-xl border border-stone-900 p-5 shadow-2xl hover:border-[#EAB308]/30 transition-all duration-300 group block">
                <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-850 flex items-center justify-center shrink-0 text-[#EAB308]">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded border border-[#EAB308]/20 bg-[#EAB308]/10 text-[#EAB308] text-[9px] uppercase font-bold tracking-wider inline-block mb-1">Help</span>
                  <h3 className="font-bold text-white group-hover:text-[#EAB308] transition-colors text-sm">{a.title}</h3>
                  <p className="text-xs text-stone-300 mt-1">{a.excerpt}</p>
                </div>
              </a>
            ))}

            {totalResults === 0 && (
              <div className="text-center py-16">
                <Search size={40} className="text-stone-800 mx-auto mb-4" />
                <p className="text-stone-300 text-sm">No results found for &ldquo;{q}&rdquo;</p>
                <p className="text-xs text-stone-400 mt-2">Try different keywords or browse our products.</p>
                <a href="/products" className="bg-[#EAB308] hover:bg-[#f1c40f] text-black font-extrabold text-xs py-2.5 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.25)] mt-6 inline-block">Browse Products</a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Search size={40} className="text-stone-850 mx-auto mb-4" />
          <p className="text-stone-400 text-xs">Type something to search...</p>
        </div>
      )}
    </div>
  );
}
