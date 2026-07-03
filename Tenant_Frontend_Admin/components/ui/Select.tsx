import * as React from"react";
import { cn } from"@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
 ({ className, children, ...props }, ref) => {
 return (
 <select
 className={cn(
"flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
 className
 )}
 ref={ref}
 {...props}
 >
 {children}
 </select>
 );
 }
);
Select.displayName ="Select";

export { Select };
