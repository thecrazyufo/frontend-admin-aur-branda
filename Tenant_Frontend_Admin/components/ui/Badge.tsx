import * as React from"react";
import { cva, type VariantProps } from"class-variance-authority";
import { cn } from"@/lib/utils";

const badgeVariants = cva(
"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 select-none",
 {
 variants: {
 variant: {
 default:
"border-transparent bg-foreground text-background",
 secondary:
"border-transparent bg-muted text-foreground",
 destructive:
"border-transparent bg-error/10 text-error border-error/20",
 outline:"text-foreground border-border",
 success:
"border-transparent bg-success/10 text-success border-success/20",
 warning:
"border-transparent bg-warning/10 text-warning border-warning/20",
 },
 },
 defaultVariants: {
 variant:"default",
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
