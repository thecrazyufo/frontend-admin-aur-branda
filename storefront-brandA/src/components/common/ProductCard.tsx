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
    <div className="bg-[--color-canvas] rounded-xl border border-[--color-hairline] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group overflow-hidden relative flex flex-col h-full">
      {/* Decorative top border glow on hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[--color-gradient-develop-start] via-[--color-gradient-preview-start] to-[--color-gradient-ship-end] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {product.badge && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border shadow-sm backdrop-blur-md ${
            product.badge === "bestseller" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
            product.badge === "popular" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
            product.badge === "new" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
            "bg-purple-500/10 text-purple-600 border-purple-500/20"
          }`}>
            {product.badge === "bestseller" ? "Best Seller" :
             product.badge === "popular" ? "Popular" :
             product.badge === "new" ? "New" : "Updated"}
          </span>
        </div>
      )}

      {/* Product Image Section (Vercel/Linear Style) */}
      {primaryImage && (
        <div className="w-full aspect-video bg-[--color-canvas] border-b border-[--color-hairline] relative overflow-hidden flex-shrink-0">
          <img 
            src={primaryImage} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">

        <h3 className="font-semibold text-[--color-ink] text-[18px] leading-tight mb-2 group-hover:text-[--color-accent] transition-colors line-clamp-2 tracking-tight">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-[--color-ink] text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-[12px] text-[--color-mute] font-medium">
            {product.rating || 0} ({(product.reviewCount || 0).toLocaleString()})
          </span>
        </div>

        <p className="text-[14px] text-[--color-body] leading-relaxed line-clamp-2 mb-auto pb-6">
          {product.shortDescription}
        </p>

        <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[--color-hairline]">
          {lowestPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-[--color-ink] text-[20px] tracking-tight">{formatPrice(lowestPrice.price)}</span>
              <span className="text-[12px] text-[--color-mute]">/ {lowestPrice.period}</span>
            </div>
          ) : (
            <span className="font-semibold text-[--color-ink] text-[18px] tracking-tight">Free</span>
          )}
        </div>

        <div className="flex gap-2">
          <a href={`/products/${product.slug}`} className="btn bg-[rgba(0,0,0,0.04)] text-[--color-ink] hover:bg-[rgba(0,0,0,0.08)] flex-1 text-[13px] py-2 justify-center transition-colors">
            Details
          </a>
          <a
            href={`/download?product=${product.slug}`}
            className="btn btn-primary text-[13px] py-2 px-3 justify-center transition-colors shadow-[0_0_15px_rgba(0,112,243,0.3)] hover:shadow-[0_0_25px_rgba(0,112,243,0.5)]"
            title="Download Free Trial"
          >
            Deploy <ArrowRight size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
