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
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500 py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm">Searching the database...</p>
        </div>
      ) : q ? (
        <>
          <p className="text-sm text-gray-500 mb-6">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;<strong className="text-gray-900">{q}</strong>&rdquo;
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { key: "all", label: `All (${totalResults})` },
              { key: "products", label: `Products (${matchedProducts.length})` },
              { key: "blog", label: `Blog (${matchedBlog.length})` },
              { key: "help", label: `Help (${matchedHelp.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Products */}
            {(activeTab === "all" || activeTab === "products") && matchedProducts.map((p) => (
              <a key={p.id} href={`/products/${p.slug}`} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors group block">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                  <Package size={18} />
                </div>
                <div>
                  <span className="badge badge-blue mb-1">Product</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                  <p class="text-sm text-gray-500">{p.shortDescription}</p>
                </div>
              </a>
            ))}

            {/* Blog */}
            {(activeTab === "all" || activeTab === "blog") && matchedBlog.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors group block">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-green-600">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="badge badge-green mb-1">Blog</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                  <p class="text-sm text-gray-500">{p.excerpt}</p>
                </div>
              </a>
            ))}

            {/* Help */}
            {(activeTab === "all" || activeTab === "help") && matchedHelp.map((a) => (
              <a key={a.id} href={`/help/${a.slug}`} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors group block">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="badge badge-amber mb-1">Help</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{a.title}</h3>
                  <p class="text-sm text-gray-500">{a.excerpt}</p>
                </div>
              </a>
            ))}

            {totalResults === 0 && (
              <div className="text-center py-16">
                <Search size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No results found for &ldquo;{q}&rdquo;</p>
                <p className="text-sm text-gray-400 mt-2">Try different keywords or browse our products.</p>
                <a href="/products" className="btn btn-primary mt-6 inline-block">Browse Products</a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Search size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Type something to search...</p>
        </div>
      )}
    </div>
  );
}
