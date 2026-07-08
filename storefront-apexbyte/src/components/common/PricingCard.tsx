import { Check, Zap, X } from "lucide-react";
import type { PricingTier } from "@/types/product";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: PricingTier;
  productSlug?: string;
}

export default function PricingCard({ tier, productSlug }: PricingCardProps) {
  const checkoutUrl =
    tier.price === 0
      ? `/download${productSlug ? `?product=${productSlug}` : ""}`
      : `/checkout?product=${productSlug || ""}&tier=${encodeURIComponent(tier.name)}`;

  return (
    <div
      className={cn(
        "relative flex flex-col transition-all duration-200",
        "rounded-[var(--radius-lg)] border",
        tier.popular
          ? [
              "border-[var(--color-apex-600)] bg-white",
              "shadow-[0_0_0_2px_var(--color-apex-600),var(--shadow-lg)]",
            ].join(" ")
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-apex-300)] hover:shadow-[var(--shadow-md)]"
      )}
    >
      {/* Popular ribbon */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1.5 bg-[var(--color-apex-600)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            <Zap size={11} fill="white" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div
        className={cn(
          "px-6 pt-8 pb-5 rounded-t-[calc(var(--radius-lg)-1px)]",
          tier.popular
            ? "bg-[var(--color-apex-50)] border-b border-[var(--color-apex-100)]"
            : "border-b border-[var(--color-border)]"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
              tier.popular
                ? "bg-[var(--color-apex-600)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
            )}
          >
            {tier.name}
          </span>
          {tier.mailboxes && (
            <span className="text-xs text-[var(--color-text-faint)] font-medium bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">
              {tier.mailboxes}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          {tier.price === 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                Free
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                ${tier.price}
              </span>
              {tier.originalPrice && (
                <span className="text-xl text-[var(--color-text-faint)] line-through font-medium">
                  ${tier.originalPrice}
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium capitalize">
            {tier.period === "lifetime" ? "One-time payment" : `Billed ${tier.period}`}
          </p>
          {tier.originalPrice && tier.price > 0 && (
            <div className="inline-flex mt-2.5 items-center gap-1 text-xs font-bold text-[var(--color-success)] bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
              Save{" "}
              {Math.round((1 - tier.price / tier.originalPrice) * 100)}%
              off
            </div>
          )}
        </div>

        {/* CTA Button */}
        <a
          href={checkoutUrl}
          className={cn(
            "btn w-full justify-center mt-4 text-sm py-2.5",
            tier.popular ? "btn-primary" : "btn-outline"
          )}
        >
          {tier.cta || (tier.price === 0 ? "Get Free Trial" : "Get Started")}
        </a>
      </div>

      {/* Features */}
      <div className="px-6 py-5 flex-1">
        <p className="text-xs text-[var(--color-text-faint)] font-semibold uppercase tracking-widest mb-4">
          What's included
        </p>
        <ul className="space-y-3">
          {tier.features.map((feature, idx) => {
            const isExcluded = feature.startsWith("-");
            const label = isExcluded ? feature.slice(1).trim() : feature;
            return (
              <li key={idx} className="flex items-start gap-2.5">
                {isExcluded ? (
                  <X
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--color-text-faint)]"
                  />
                ) : (
                  <Check
                    size={14}
                    className={cn(
                      "mt-0.5 shrink-0",
                      tier.popular
                        ? "text-[var(--color-apex-600)]"
                        : "text-[var(--color-success)]"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm font-medium leading-snug",
                    isExcluded
                      ? "text-[var(--color-text-faint)] line-through"
                      : "text-[var(--color-text-secondary)]"
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
