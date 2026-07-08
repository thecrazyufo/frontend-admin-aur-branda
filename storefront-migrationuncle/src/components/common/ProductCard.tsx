import type { Product } from "@/types/product";
import { Star, Download, ArrowRight, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const BADGE_MAP: Record<string, { label: string; className: string }> = {
  bestseller: { label: "Best Seller", className: "badge badge-blue" },
  popular:    { label: "Popular",     className: "badge badge-cyan" },
  new:        { label: "New",         className: "badge badge-green" },
  updated:    { label: "Updated",     className: "badge badge-amber" },
};

export default function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.pricing?.find((p) => p.price > 0);
  const badgeInfo = product.badge ? BADGE_MAP[product.badge] : null;
  const avgRating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="group overflow-hidden flex flex-col bg-white rounded-3xl border-2 border-[var(--color-border)] shadow-sm hover:shadow-xl hover:border-[var(--color-uncle-300)] transition-all duration-300 hover:-translate-y-1">
      {/* Card header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-uncle-50)] border border-[var(--color-uncle-100)] flex items-center justify-center text-[var(--color-uncle-600)] group-hover:bg-[var(--color-uncle-100)] transition-colors">
            <Download size={22} strokeWidth={2.5} />
          </div>

          {/* Badge */}
          {badgeInfo && (
            <span className={badgeInfo.className}>{badgeInfo.label}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-[var(--color-text-primary)] text-base leading-snug mb-1.5 group-hover:text-[var(--color-uncle-600)] transition-colors line-clamp-2 tracking-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(avgRating) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-xs text-[var(--color-text-faint)] font-medium">
              {avgRating.toFixed(1)} ({reviewCount.toLocaleString()})
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-3 flex-1">
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      {/* Key features (first 2 only) */}
      {product.features && product.features.length > 0 && (
        <div className="px-5 pb-3">
          <ul className="space-y-1">
            {product.features.slice(0, 2).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <CheckCircle size={12} className="text-[var(--color-uncle-500)] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price + CTA */}
      <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4 mt-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            {lowestPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-[var(--color-text-primary)] text-xl tracking-tight">
                  {formatPrice(lowestPrice.price)}
                </span>
                {lowestPrice.originalPrice && (
                  <span className="text-sm text-[var(--color-text-faint)] line-through">
                    {formatPrice(lowestPrice.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[var(--color-text-faint)]">
                  / {lowestPrice.period}
                </span>
              </div>
            ) : (
              <span className="font-bold text-[var(--color-success)] text-lg">
                Free Trial
              </span>
            )}
          </div>

          {/* Discount badge */}
          {lowestPrice?.originalPrice && lowestPrice.price > 0 && (
            <span className="text-xs font-bold text-[var(--color-success)] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Save{" "}
              {Math.round(
                (1 - lowestPrice.price / lowestPrice.originalPrice) * 100
              )}
              %
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <a
            href={`/products/${product.slug}`}
            className="btn btn-primary flex-1 text-sm py-2.5 justify-center"
          >
            View Details
            <ArrowRight size={13} />
          </a>
          <a
            href={`/download?product=${product.slug}`}
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
