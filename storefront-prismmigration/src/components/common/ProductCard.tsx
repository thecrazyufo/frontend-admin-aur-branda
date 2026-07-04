import type { Product } from "@/types/product";
import { Star, Download, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.pricing?.find((p) => p.price > 0);
  const primaryImage = product.seo?.ogImage || product.screenshots?.[0]?.url;

  return (
    <div className="bg-stone-900/30 backdrop-blur border border-stone-800/80 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.08)] hover:border-[#EAB308]/45 group overflow-hidden relative flex flex-col h-full">
      {/* Decorative top border glow on hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#22D3EE] via-[#EAB308] to-[#C026D3] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Floating neon background accents */}
      <div className="absolute -left-10 top-1/4 w-20 h-20 bg-[#22D3EE]/5 blur-xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
      <div className="absolute -right-10 bottom-1/4 w-20 h-20 bg-[#C026D3]/5 blur-xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

      {/* Background prism motif visible on hover */}
      <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
        <svg className="w-16 h-16 text-[#EAB308]" viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,15 15,80 85,80" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {product.badge && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border shadow-sm backdrop-blur-md ${
            product.badge === "bestseller" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
            product.badge === "popular" ? "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20" :
            product.badge === "new" ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20" : 
            "bg-[#C026D3]/10 text-purple-400 border-[#C026D3]/20"
          }`}>
            {product.badge === "bestseller" ? "Best Seller" :
             product.badge === "popular" ? "Popular" :
             product.badge === "new" ? "New" : "Updated"}
          </span>
        </div>
      )}

      {/* Product Image Section */}
      {primaryImage && (
        <div className="w-full aspect-video bg-stone-950 border-b border-stone-800/80 relative overflow-hidden flex-shrink-0">
          <img 
            src={primaryImage} 
            alt={product.name} 
            className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-center gap-1.5 mb-2.5">
          <svg className="w-3.5 h-3.5 text-[#EAB308] filter drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,15 15,80 85,80" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-[#EAB308]">
            Prism Engine
          </span>
        </div>

        <h3 className="font-bold text-white text-[16px] leading-tight mb-2 group-hover:text-[#EAB308] transition-colors line-clamp-2 tracking-tight">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-[#EAB308] text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-[12px] text-stone-400 font-medium">
            {product.rating || 0} ({(product.reviewCount || 0).toLocaleString()})
          </span>
        </div>

        <p className="text-[12px] text-[#E5E5E5] leading-relaxed line-clamp-2 mb-auto pb-6">
          {product.shortDescription}
        </p>

        <div className="flex items-center gap-2 mb-6 pb-6 border-b border-stone-800/60">
          {lowestPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-white text-[20px] tracking-tight">{formatPrice(lowestPrice.price)}</span>
              <span className="text-[12px] text-stone-400">/ {lowestPrice.period}</span>
            </div>
          ) : (
            <span className="font-extrabold text-white text-[18px] tracking-tight">Free</span>
          )}
        </div>

        <div className="flex gap-2">
          <a href={`/products/${product.slug}`} className="border border-[#EAB308]/30 hover:border-[#EAB308] bg-stone-900/60 hover:bg-[#EAB308]/10 text-[#EAB308] flex-1 text-[13px] py-2 rounded-md flex items-center justify-center font-bold transition-all duration-300">
            Details
          </a>
          <a
            href={`/download?product=${product.slug}`}
            className="bg-[#EAB308] hover:bg-[#f1c40f] text-black font-extrabold flex-1 text-[13px] py-2 rounded-md flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-[0_0_12px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            title="Download Free Trial"
          >
            Deploy <ArrowRight size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
