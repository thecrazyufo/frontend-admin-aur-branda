import Link from"next/link";
import { Check, Zap } from"lucide-react";
import { PricingTier } from"@/types/product";
import { formatPrice } from"@/lib/utils";
import { cn } from"@/lib/utils";

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
 ?"border-blue-500 shadow-[0_0_0_2px_#1a56db,0_20px_40px_rgba(26,86,219,0.15)] bg-white scale-[1.02]"
 :"border-gray-200 shadow-sm bg-white hover:border-blue-200 hover:shadow-md"
 )}
 >
 {/* Popular badge */}
 {tier.popular && (
 <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
 <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
 <Zap size={11} />
 Most Popular
 </span>
 </div>
 )}

 {/* Header */}
 <div className="mb-5">
 <h3 className="font-bold text-gray-900 text-lg mb-1">{tier.name}</h3>
 {tier.mailboxes && (
 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
 {tier.mailboxes}
 </span>
 )}
 </div>

 {/* Price */}
 <div className="mb-6">
 {tier.price === 0 ? (
 <div className="flex items-end gap-1">
 <span className="text-4xl font-bold text-gray-900">Free</span>
 </div>
 ) : (
 <div className="flex items-end gap-2">
 <span className="text-4xl font-bold text-gray-900">
 ${tier.price}
 </span>
 {tier.originalPrice && (
 <span className="text-lg text-gray-400 line-through mb-1">
 ${tier.originalPrice}
 </span>
 )}
 </div>
 )}
 <p className="text-xs text-gray-500 mt-1 capitalize">
 {tier.period ==="lifetime" ?"One-time payment" :`Billed ${tier.period}`}
 </p>
 {tier.originalPrice && tier.price > 0 && (
 <span className="inline-block mt-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
 Save ${tier.originalPrice - tier.price} ({Math.round((1 - tier.price / tier.originalPrice) * 100)}% off)
 </span>
 )}
 </div>

 {/* CTA */}
 <Link
 href={tier.price === 0
 ?`/download${productSlug ?`?product=${productSlug}` :""}`
 :`/products/${productSlug ||""}#buy`}
 className={cn(
"btn w-full justify-center mb-6",
 tier.popular ?"btn-primary" :"btn-outline"
 )}
 >
 {tier.cta}
 </Link>

 {/* Features */}
 <ul className="space-y-3 flex-1">
 {tier.features.map((feature) => (
 <li key={feature} className="flex items-start gap-2.5">
 <Check size={15} className={cn("mt-0.5 shrink-0", tier.popular ?"text-blue-600" :"text-green-500")} />
 <span className="text-sm text-gray-600">{feature}</span>
 </li>
 ))}
 </ul>
 </div>
 );
}
