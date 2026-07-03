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
        <span className={cn(
          "inline-block text-[12px] font-bold uppercase tracking-widest mb-3",
          light ? "text-[--color-mute]" : "bg-gradient-to-r from-[--color-gradient-develop-start] to-[--color-gradient-preview-start] bg-clip-text text-transparent"
        )}>
          {eyebrow}
        </span>
      )}
      <h2 className={cn("mb-4", light ? "text-[--color-canvas]" : "text-[--color-ink]")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("text-[16px] max-w-2xl", light ? "text-[--color-mute]" : "text-[--color-body]", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
