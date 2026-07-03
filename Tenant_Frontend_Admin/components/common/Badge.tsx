import { cn } from"@/lib/utils";

type BadgeVariant ="blue" |"green" |"amber" |"red" |"purple" |"gray";

interface BadgeProps {
 children: React.ReactNode;
 variant?: BadgeVariant;
 className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
 blue:"badge-blue",
 green:"badge-green",
 amber:"badge-amber",
 red:"badge-red",
 purple:"badge-purple",
 gray:"bg-gray-100 text-gray-600",
};

export default function Badge({ children, variant ="blue", className }: BadgeProps) {
 return (
 <span className={cn("badge", variantMap[variant], className)}>
 {children}
 </span>
 );
}
