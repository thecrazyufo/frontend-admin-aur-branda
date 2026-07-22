import type { Product } from "@/types/product";
import { Star, Download, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.pricing?.find((p) => p.price > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover group overflow-hidden">
      {product.badge && (
        <div className="px-5 pt-5">
          <span className={`badge ${
            product.badge === "bestseller" ? "badge-blue" :
            product.badge === "popular" ? "badge-green" :
            product.badge === "new" ? "badge-amber" : "badge-purple"
          }`}>
            {product.badge === "bestseller" ? "🏆 Best Seller" :
             product.badge === "popular" ? "🔥 Popular" :
             product.badge === "new" ? "✨ New" : "🔄 Updated"}
          </span>
        </div>
      )}

      <div className="p-5 pt-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow">
          <Download size={24} className="text-white" />
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-amber-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.rating || 0} ({(product.reviewCount || 0).toLocaleString()})
          </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.shortDescription}</p>

        <div className="flex items-center gap-2 mb-4">
          {lowestPrice ? (
            <>
              <span className="font-bold text-gray-900 text-lg">{formatPrice(lowestPrice.price)}</span>
              {lowestPrice.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(lowestPrice.originalPrice)}</span>
              )}
              <span className="text-xs text-gray-500">/ {lowestPrice.period}</span>
            </>
          ) : (
            <span className="font-bold text-green-600">Free Trial</span>
          )}
        </div>

        <div className="flex gap-2">
          <a href={`/products/${product.slug}`} className="btn btn-primary flex-1 text-sm py-2.5 justify-center">
            View Details <ArrowRight size={14} />
          </a>
          <a
            href={product.trialDownloadUrl || `/download?product=${product.slug}`}
            className="btn btn-outline text-sm py-2.5 px-3"
            title="Download Free Trial"
          >
            <Download size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
