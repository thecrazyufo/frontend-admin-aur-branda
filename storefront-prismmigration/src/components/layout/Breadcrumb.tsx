import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/types/common";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 border-b border-[#334155] bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="container-custom">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <a href="/" className="flex items-center text-[#94A3B8] hover:text-[#14B8A6] transition-colors">
              <Home size={14} />
            </a>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-stone-600" />
              {item.href && index < items.length - 1 ? (
                <a href={item.href} className="text-[#94A3B8] hover:text-[#14B8A6] transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-white font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
