import { LucideIcon } from"lucide-react";
import { cn } from"@/lib/utils";

interface FeatureCardProps {
 icon: LucideIcon;
 title: string;
 description: string;
 variant?:"default" |"bordered" |"dark";
 iconColor?: string;
}

export default function FeatureCard({
 icon: Icon,
 title,
 description,
 variant ="default",
 iconColor ="text-blue-600",
}: FeatureCardProps) {
 return (
 <div
 className={cn(
"rounded-2xl p-6 transition-all duration-300",
 variant ==="default" &&"bg-white border border-gray-100 shadow-sm card-hover",
 variant ==="bordered" &&"bg-white border-2 border-gray-100 hover:border-blue-200 shadow-sm card-hover",
 variant ==="dark" &&"bg-white/5 border border-white/10 hover:bg-white/10"
 )}
 >
 <div className={cn(
"w-12 h-12 rounded-xl flex items-center justify-center mb-4",
 variant ==="dark" ?"bg-white/10" :"bg-blue-50"
 )}>
 <Icon size={22} className={variant ==="dark" ?"text-blue-400" : iconColor} />
 </div>
 <h3 className={cn("font-bold text-base mb-2", variant ==="dark" ?"text-white" :"text-gray-900")}>
 {title}
 </h3>
 <p className={cn("text-sm leading-relaxed", variant ==="dark" ?"text-gray-400" :"text-gray-500")}>
 {description}
 </p>
 </div>
 );
}
