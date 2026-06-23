import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/types/common";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 border-b border-gray-100 bg-gray-50">
      <div className="container-custom">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <a href="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
              <Home size={14} />
            </a>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-gray-400" />
              {item.href && index < items.length - 1 ? (
                <a href={item.href} className="text-gray-500 hover:text-blue-600 transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
