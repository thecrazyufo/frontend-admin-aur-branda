import { cn } from"@/lib/utils";

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
 <div className={cn(centered &&"text-center", className)}>
 {eyebrow && (
 <span className={cn(
"inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full",
 light
 ?"text-blue-300 bg-white/10"
 :"text-blue-600 bg-blue-50"
 )}>
 {eyebrow}
 </span>
 )}
 <h2 className={cn("font-bold leading-tight mb-3", light ?"text-white" :"text-gray-900")}>
 {title}
 </h2>
 {centered && <div className={cn("divider mx-auto", light ?"bg-gradient-to-r from-blue-400 to-amber-400" :"")} />}
 {!centered && <div className="divider" />}
 {subtitle && (
 <p className={cn("text-base max-w-2xl mt-4", light ?"text-gray-300" :"text-gray-500", centered &&"mx-auto")}>
 {subtitle}
 </p>
 )}
 </div>
 );
}
