import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow && (
        <span
          className={cn(
            "inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full",
            light
              ? "text-[var(--color-apex-300)] bg-white/10"
              : "text-[var(--color-apex-700)] bg-[var(--color-apex-100)]"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-extrabold tracking-tight leading-tight mb-3",
          light ? "text-white" : "text-[var(--color-text-primary)]"
        )}
      >
        {title}
      </h2>
      {/* Accent divider line */}
      <div
        className={cn("divider", centered && "mx-auto")}
        style={{ background: light ? "linear-gradient(90deg, var(--color-cyan-400), var(--color-apex-400))" : undefined }}
      />
      {subtitle && (
        <p
          className={cn(
            "text-base mt-4 max-w-2xl leading-relaxed",
            light ? "text-[var(--color-apex-300)]" : "text-[var(--color-text-muted)]",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
