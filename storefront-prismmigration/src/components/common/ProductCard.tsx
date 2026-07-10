import type { Product } from "@/types/product";
import { Star, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

/** Prettify raw format keys → display labels */
function formatLabel(raw: string): string {
  const MAP: Record<string, string> = {
    pst: "PST", ost: "OST", mbox: "MBOX", eml: "EML", msg: "MSG",
    emlx: "EMLX", nsf: "NSF", olm: "OLM", dbx: "DBX", vcf: "VCF",
    ics: "ICS", csv: "CSV", pdf: "PDF", html: "HTML", rtf: "RTF",
    gmail: "Gmail", google_workspace: "Workspace", exchange: "Exchange",
    office365: "Office 365", outlook: "Outlook", lotus_notes: "Lotus Notes",
    zimbra: "Zimbra", thunderbird: "Thunderbird", imap: "IMAP",
    yahoo: "Yahoo Mail", hotmail: "Hotmail", live: "Live Mail",
    aol: "AOL", apple_mail: "Apple Mail", entourage: "Entourage",
    groupwise: "GroupWise", sharepoint: "SharePoint", onedrive: "OneDrive",
    dropbox: "Dropbox", aws_s3: "AWS S3", azure: "Azure Blob",
  };
  return MAP[raw.toLowerCase()] ?? raw.toUpperCase();
}

/** Assign a subtle colour class per format type */
function formatColor(raw: string): string {
  const r = raw.toLowerCase();
  if (["pst", "ost", "outlook", "msg", "olm"].includes(r)) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  if (["gmail", "google_workspace"].includes(r)) return "text-red-400 bg-red-500/10 border-red-500/20";
  if (["exchange", "office365", "sharepoint", "onedrive"].includes(r)) return "text-sky-400 bg-sky-500/10 border-sky-500/20";
  if (["mbox", "eml", "emlx", "thunderbird", "imap"].includes(r)) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  if (["lotus_notes", "nsf", "groupwise", "zimbra"].includes(r)) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  if (["pdf", "html", "csv", "rtf"].includes(r)) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  return "text-purple-400 bg-purple-500/10 border-purple-500/20";
}

/** The visual migration flow header: Sources → PRISM → Targets */
function MigrationFlowHeader({ sources, targets }: { sources: string[]; targets: string[] }) {
  const hasFlow = sources.length > 0 || targets.length > 0;

  return (
    <div className="w-full h-[130px] bg-[#070B14] border-b border-[#1F2937] relative overflow-hidden flex-shrink-0 flex items-center justify-between px-4 gap-2">
      {/* Subtle animated radial glow behind prism */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-32 h-32 rounded-full bg-[#6366F1] opacity-[0.07] blur-2xl"
          style={{ animation: "pulse 3s ease-in-out infinite" }}
        />
      </div>

      {/* Grid dot background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #6366F1 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* ── Left: Source Formats ── */}
      <div className="flex flex-col gap-1.5 z-10 min-w-0 flex-1">
        {hasFlow && sources.length > 0 ? (
          sources.slice(0, 3).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${formatColor(s)} leading-none whitespace-nowrap`}
            >
              {formatLabel(s)}
            </span>
          ))
        ) : (
          // Fallback skeleton pills when no data
          <>
            <span className="h-4 w-12 rounded bg-[#1F2937]/60 animate-pulse" />
            <span className="h-4 w-10 rounded bg-[#1F2937]/40 animate-pulse" />
          </>
        )}
      </div>

      {/* ── Center: Flow arrows + Prism ── */}
      <div className="flex items-center gap-1.5 z-10 flex-shrink-0">
        {/* Dashed flow line left */}
        <div className="flex items-center gap-0.5 opacity-40">
          <div className="w-3 h-px bg-[#6366F1]" />
          <div className="w-1.5 h-px bg-[#6366F1]" />
          <div className="w-1 h-px bg-[#6366F1]" />
        </div>

        {/* Prism Triangle — the centrepiece */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-14 h-14 rounded-full border border-[#6366F1]/20"
            style={{ animation: "spin 12s linear infinite" }}
          />
          <svg
            viewBox="0 0 100 100"
            className="w-10 h-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.7)]"
            fill="none"
          >
            {/* Gradient fill */}
            <defs>
              <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="prismStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            <polygon
              points="50,10 10,85 90,85"
              fill="url(#prismGrad)"
              stroke="url(#prismStroke)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Inner refraction lines */}
            <line x1="50" y1="10" x2="50" y2="85" stroke="#A5B4FC" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="50" y1="10" x2="30" y2="85" stroke="#C084FC" strokeWidth="0.8" strokeOpacity="0.3" />
            <line x1="50" y1="10" x2="70" y2="85" stroke="#818CF8" strokeWidth="0.8" strokeOpacity="0.3" />
          </svg>
        </div>

        {/* Dashed flow line right */}
        <div className="flex items-center gap-0.5 opacity-40">
          <div className="w-1 h-px bg-[#A855F7]" />
          <div className="w-1.5 h-px bg-[#A855F7]" />
          <div className="w-3 h-px bg-[#A855F7]" />
        </div>
      </div>

      {/* ── Right: Target/Destination Formats ── */}
      <div className="flex flex-col gap-1.5 z-10 min-w-0 flex-1 items-end">
        {hasFlow && targets.length > 0 ? (
          targets.slice(0, 3).map((t) => (
            <span
              key={t}
              className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${formatColor(t)} leading-none whitespace-nowrap`}
            >
              {formatLabel(t)}
            </span>
          ))
        ) : (
          <>
            <span className="h-4 w-14 rounded bg-[#1F2937]/60 animate-pulse" />
            <span className="h-4 w-10 rounded bg-[#1F2937]/40 animate-pulse" />
          </>
        )}
      </div>

      {/* Spectral light leak bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gradient-to-t from-[#6366F1]/10 to-transparent blur-sm pointer-events-none" />
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.pricing?.find((p) => p.price > 0);
  const sources = product.sourceFormats ?? [];
  const targets = product.targetFormats ?? [];

  // Targets to show as badges below the title (all of them, clipped by CSS)
  const destinationBadges = targets.slice(0, 5);

  return (
    <div className="bg-[#0B0F1A]/80 backdrop-blur-xl border border-[#334155] rounded-xl shadow-2xl transition-all duration-300 hover:border-[#6366F1]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] group overflow-hidden relative flex flex-col h-full min-h-[380px]">

      {/* Top gradient accent line on hover */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#C026D3] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 right-3 z-30">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border backdrop-blur-md ${
            product.badge === "bestseller" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
            product.badge === "popular"    ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
            product.badge === "new"        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                             "bg-purple-500/10 text-purple-400 border-purple-500/20"
          }`}>
            {product.badge === "bestseller" ? "Best Seller" :
             product.badge === "popular"    ? "Popular" :
             product.badge === "new"        ? "New" : "Updated"}
          </span>
        </div>
      )}

      {/* ── Migration Flow Header ── */}
      <MigrationFlowHeader sources={sources} targets={targets} />

      {/* ── Card Body ── */}
      <div className="p-5 flex flex-col flex-grow relative z-10">

        {/* Category & Version */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] tracking-wider uppercase font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded border border-[#6366F1]/20 font-mono">
            {product.category?.replace('-', ' ')}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 font-semibold">
            v{product.version || "1.0.0"}
          </span>
        </div>

        {/* Product name */}
        <h3 className="font-bold text-white text-[16px] leading-snug mb-2 group-hover:text-[#818CF8] transition-colors line-clamp-1 tracking-tight">
          <a href={`/products/${product.slug}`} className="hover:underline text-inherit">
            {product.name}
          </a>
        </h3>

        {/* Destination format pills */}
        {destinationBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {destinationBadges.map((t) => (
              <span
                key={t}
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${formatColor(t)} leading-none`}
              >
                <span className="w-1 h-1 rounded-full bg-current opacity-70 flex-shrink-0" />
                {formatLabel(t)}
              </span>
            ))}
            {targets.length > 5 && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold text-[#6B7280] border border-[#1F2937] rounded leading-none">
                +{targets.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-[#6366F1]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            {product.rating || 0} <span className="text-zinc-650">({(product.reviewCount || 0).toLocaleString()})</span>
          </span>
        </div>

        {/* Short description */}
        <p className="text-[12px] text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">
          {product.shortDescription}
        </p>

        {/* Engine Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-5 mt-auto">
            <ul className="space-y-1.5 text-[11px]">
              {product.features.slice(0, 2).map((feat: string) => (
                <li key={feat} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0 text-[#6366F1]" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35"/>
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="truncate text-[#94A3B8]">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing and Actions Footer */}
        <div className="border-t border-[#334155]/60 pt-4 mt-auto flex items-center justify-between">
          <div>
            <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Starting at</div>
            {lowestPrice ? (
              <div className="flex items-baseline gap-0.5">
                <span className="font-extrabold text-white text-[16px] tracking-tight">
                  {formatPrice(lowestPrice.price)}
                </span>
                <span className="text-[9px] text-[#6B7280]">/{lowestPrice.period === "one-time" ? "lifetime" : lowestPrice.period}</span>
              </div>
            ) : (
              <span className="font-extrabold text-emerald-400 text-[15px] tracking-tight">Free</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/download?product=${product.slug}`}
              className="border border-[#334155] hover:border-[#6366F1]/60 bg-[#1E2937]/50 hover:bg-[#6366F1]/10 text-[#94A3B8] hover:text-[#6366F1] py-2 px-3.5 rounded-lg text-[11px] min-h-[34px] flex items-center justify-center font-bold transition-all duration-300"
            >
              Trial
            </a>
            <a
              href={`/checkout?product=${product.slug}&tier=Standard`}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white py-2 px-3.5 rounded-lg text-[11px] min-h-[34px] flex items-center justify-center font-extrabold transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)]"
            >
              Buy Key
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
