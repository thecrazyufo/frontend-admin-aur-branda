import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white border-b py-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="container-custom">
        <ol className="flex items-center gap-1 text-xs font-medium flex-wrap">
          <li>
            <a
              href="/"
              className="flex items-center gap-1 transition-colors"
              style={{ color: "var(--color-text-faint)" }}
              aria-label="Home"
            >
              <Home size={12} />
            </a>
          </li>
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <ChevronRight size={11} style={{ color: "var(--color-text-faint)" }} />
              {item.href ? (
                <a
                  href={item.href}
                  className="transition-colors hover:text-[var(--color-apex-600)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
