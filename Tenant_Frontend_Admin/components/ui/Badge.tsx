import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        destructive:
          "border-transparent bg-red-500/10 text-red-500 border border-red-500/20 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
        outline: "text-zinc-950 border border-zinc-200 dark:text-zinc-50 dark:border-zinc-800",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
        warning:
          "border-transparent bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
