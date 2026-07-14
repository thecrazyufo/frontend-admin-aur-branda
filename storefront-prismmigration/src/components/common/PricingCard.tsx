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
        "relative rounded-xl border p-6 flex flex-col transition-all duration-300",
        tier.popular
          ? "border-[var(--signal-teal)] shadow-[0_0_20px_rgba(0,200,160,0.08)] bg-[var(--slate-surface)] scale-[1.02]"
          : "border-[var(--circuit-line)] bg-[var(--slate-surface)] hover:border-stone-700"
      )}
    >
      {/* Background glow removed for spec-card simplicity */}

      {/* Popular badge using signal-teal */}
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="text-stone-950 text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded flex items-center gap-1.5" style={{background: 'var(--signal-teal)', boxShadow: '0 0 15px rgba(0,200,160,0.25)', fontFamily: 'var(--font-mono)'}}>
            <Zap size={11} className="text-stone-950 fill-stone-950" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-white uppercase text-base mb-1 tracking-wider" style={{fontFamily: 'var(--font-mono)'}}>{tier.name}</h3>
        {tier.bestFor && (
          <p className="text-xs text-[#E2E8F0]/90 mb-1.5">
            <span className="font-semibold text-stone-400">Best For:</span> {tier.bestFor}
          </p>
        )}
        {tier.description && (
          <p className="text-xs leading-relaxed my-2 p-2.5 rounded-lg border" style={{color: 'var(--type-muted)', background: 'var(--ink-void)', borderColor: 'var(--circuit-line)'}}>
            {tier.description}
          </p>
        )}
        {tier.mailboxes && (
          <span className="inline-block text-[10px] bg-stone-850 border px-2 py-0.5 rounded mt-1" style={{color: 'var(--type-muted)', borderColor: 'var(--circuit-line)', fontFamily: 'var(--font-mono)'}}>
            {tier.mailboxes}
          </span>
        )}
      </div>

      {/* Price in large JetBrains Mono */}
      <div className="mb-6">
        {tier.price === 0 ? (
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-white" style={{fontFamily: 'var(--font-mono)'}}>Free</span>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[var(--amber-alert)]" style={{fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em'}}>
              ${tier.price}
            </span>
            {tier.originalPrice && (
              <span className="text-lg text-stone-500 line-through mb-1" style={{fontFamily: 'var(--font-mono)'}}>
                ${tier.originalPrice}
              </span>
            )}
          </div>
        )}
        <p className="text-xs mt-1 capitalize" style={{color: 'var(--type-faint)', fontFamily: 'var(--font-mono)'}}>
          {tier.period === "lifetime" ? "One-time payment" : `Billed ${tier.period}`}
        </p>
        {tier.originalPrice && tier.price > 0 && (
          <span className="inline-block mt-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border" style={{color: 'var(--signal-teal)', background: 'rgba(0,200,160,0.08)', borderColor: 'rgba(0,200,160,0.2)'}}>
            Save ${tier.originalPrice - tier.price} ({Math.round((1 - tier.price / tier.originalPrice) * 100)}% off)
          </span>
        )}
      </div>

      {/* CTA Button using signal-teal */}
      <a
        href={tier.price === 0
          ? `/download${productSlug ? `?product=${productSlug}` : ""}`
          : `/checkout?product=${productSlug || ""}&tier=${encodeURIComponent(tier.name)}`}
        className={cn(
          "w-full text-center text-xs py-2.5 font-bold rounded transition-all duration-300 transform active:scale-95 flex items-center justify-center mb-6 cursor-pointer",
          tier.popular
            ? "text-black shadow-[0_0_15px_rgba(0,200,160,0.2)] hover:shadow-[0_0_20px_rgba(0,200,160,0.35)]"
            : "border transition-colors hover:text-white"
        )}
        style={tier.popular
          ? {background: 'var(--signal-teal)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em'}
          : {border: '1px solid rgba(0,200,160,0.3)', background: 'rgba(0,200,160,0.05)', color: 'var(--signal-teal)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em'}
        }
      >
        {tier.cta}
      </a>

      <ul className="space-y-3 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0" style={{color: 'var(--signal-teal)'}} />
            <span className="text-sm text-[#E2E8F0]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
