import { Check, Zap } from "lucide-react";
import type { PricingTier } from "@/types/product";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: PricingTier;
  productSlug?: string;
}

export default function PricingCard({ tier, productSlug }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 flex flex-col transition-all duration-300",
        tier.popular
          ? "border-[#EAB308] shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-stone-900/50 scale-[1.02]"
          : "border-stone-800/85 bg-stone-900/20 hover:border-stone-700 hover:shadow-[0_0_20px_rgba(234,179,8,0.05)]"
      )}
    >
      {/* Background neon blur glow on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#EAB308]/5 blur-2xl rounded-full pointer-events-none -z-10"></div>

      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#EAB308] text-stone-950 text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Zap size={11} className="text-stone-950 fill-stone-950" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-bold text-white text-lg mb-1">{tier.name}</h3>
        {tier.mailboxes && (
          <span className="text-[10px] text-stone-300 bg-stone-850 border border-stone-800 px-2 py-0.5 rounded">
            {tier.mailboxes}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        {tier.price === 0 ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-white">Free</span>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">
              ${tier.price}
            </span>
            {tier.originalPrice && (
              <span className="text-lg text-stone-500 line-through mb-1">
                ${tier.originalPrice}
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-stone-400 mt-1 capitalize">
          {tier.period === "lifetime" ? "One-time payment" : `Billed ${tier.period}`}
        </p>
        {tier.originalPrice && tier.price > 0 && (
          <span className="inline-block mt-2.5 text-[9px] font-bold uppercase tracking-wider text-[#EAB308] bg-[#EAB308]/10 px-2 py-0.5 rounded border border-[#EAB308]/20">
            Save ${tier.originalPrice - tier.price} ({Math.round((1 - tier.price / tier.originalPrice) * 100)}% off)
          </span>
        )}
      </div>

      {/* CTA */}
      <a
        href={tier.price === 0
          ? `/download${productSlug ? `?product=${productSlug}` : ""}`
          : `/checkout?product=${productSlug || ""}&tier=${encodeURIComponent(tier.name)}`}
        className={cn(
          "w-full text-center text-xs py-2.5 font-bold rounded transition-all duration-300 transform active:scale-95 flex items-center justify-center mb-6 cursor-pointer",
          tier.popular
            ? "bg-[#EAB308] hover:bg-[#f1c40f] text-black shadow-[0_0_15px_rgba(234,179,8,0.25)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            : "border border-[#EAB308]/30 hover:border-[#EAB308] bg-stone-900/60 hover:bg-[#EAB308]/10 text-[#EAB308] hover:text-white"
        )}
      >
        {tier.cta}
      </a>

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0 text-[#EAB308]" />
            <span className="text-sm text-stone-300">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
