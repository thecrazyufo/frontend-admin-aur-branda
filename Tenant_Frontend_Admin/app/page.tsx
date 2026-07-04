"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import Link from"next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Button } from"@/components/ui/Button";

import { useEffect } from"react";
import { BrandAPI } from"@/services/api";

const ROLES = [
 { id:"ADMIN", name:"Brand Administrator", desc:"Full administrative access to settings, catalog, content, and licensing.", icon:"🔑" },
 { id:"SEO_CW_PRODUCT_MANAGER", name:"SEO/CW & Product Manager", desc:"Manage products, categories, blog articles, FAQs, and help files.", icon:"📝" },
];

const accentColors: Record<string, string> = {
 indigo:"border-indigo-500/20 hover:border-indigo-500 bg-indigo-500/5 hover:shadow-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400",
 violet:"border-violet-500/20 hover:border-violet-500 bg-violet-500/5 hover:shadow-violet-500/5 hover:bg-violet-500/10 text-violet-400",
 cyan:"border-cyan-500/20 hover:border-cyan-500 bg-cyan-500/5 hover:shadow-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400",
 emerald:"border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 hover:shadow-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400",
 amber:"border-amber-500/20 hover:border-amber-500 bg-amber-500/5 hover:shadow-amber-500/5 hover:bg-amber-500/10 text-amber-400",
};

export default function PortalPage() {
 const router = useRouter();
 const [sites, setSites] = useState<any[]>([]);
 const [selectedBrand, setSelectedBrand] = useState<any | null>(null);

 useEffect(() => {
 BrandAPI.getActiveBrands().then(setSites).catch(console.error);
 }, []);

 function handleRoleSelect(roleId: string) {
 if (!selectedBrand) return;
 router.push(`/admin/login?brandId=${selectedBrand.id}&targetRole=${roleId}`);
 }

 return (
 <div className="relative min-h-screen bg-background flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
 {/* Background Glow */}
 <div className="absolute inset-0 pointer-events-none z-0">
 <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/5 blur-[120px]" />
 <div className="absolute -bottom-[10%] -right-[10%] w-[35rem] h-[35rem] rounded-full bg-violet-500/5 blur-[100px]" />
 </div>

 <div className="w-full max-w-5xl z-10 space-y-12">
 {/* Header */}
 <header className="text-center space-y-4">
 <div className="inline-flex items-center justify-center p-2.5 bg-muted border border-border rounded-xl">
 <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
 <rect width="32" height="32" rx="6" fill="url(#pgrad)" />
 <path d="M8 16L13 21L24 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
 <defs>
 <linearGradient id="pgrad" x1="0" y1="0" x2="32" y2="32">
 <stop offset="0%" stopColor="#6366f1" />
 <stop offset="100%" stopColor="#8b5cf6" />
 </linearGradient>
 </defs>
 </svg>
 </div>
 <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
 Multi-Tenant Admin Portal
 </h1>
 <p className="text-sm text-muted-foreground max-w-md mx-auto">
 Select a brand storefront below to begin managing resources.
 </p>
 <div>
 <Link href="/admin/login">
 <Button variant="outline" className="text-xs font-semibold py-1.5 px-4 h-8 gap-2 text-muted-foreground hover:text-foreground">
 🔑 Super Admin login
 </Button>
 </Link>
 </div>
 </header>

 {/* Brands Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
 {sites.map((site) => {
 let colorKey ="indigo";
 try {
 if (site.themeColors) {
 const theme = JSON.parse(site.themeColors);
 if (theme.accent) colorKey = theme.accent;
 }
 } catch (e) {}
 
 return (
 <Card
 key={site.id}
 onClick={() => setSelectedBrand(site)}
 className={`group flex flex-col justify-between p-5 border cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg backdrop-blur-md ${accentColors[colorKey] || accentColors["indigo"]}`}
 >
 <div>
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-muted/60 border border-border/80 mb-4 group-hover:scale-105 transition-transform duration-200">
 {site.features && JSON.parse(site.features).icon ? JSON.parse(site.features).icon :"🛡️"}
 </div>
 <h3 className="text-sm font-bold text-foreground group-hover:text-muted-foreground">{site.name}</h3>
 <p className="text-[11px] text-muted-foreground leading-normal mt-2">{site.domain}</p>
 </div>
 <span className="text-[10px] font-bold tracking-wider mt-5 opacity-80 group-hover:opacity-100 uppercase transition-opacity">
 Manage storefront →
 </span>
 </Card>
 );
 })}
 </div>

 {/* Role Selection Modal */}
 {selectedBrand && (
 <div 
 className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
 onClick={() => setSelectedBrand(null)}
 >
 <Card 
 className="w-full max-w-md border-border p-6 space-y-6"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-start justify-between">
 <div>
 <CardTitle className="text-base font-extrabold text-foreground">
 Access: {selectedBrand.name}
 </CardTitle>
 <CardDescription className="text-xs text-muted-foreground mt-1">
 Choose your workspace role to log in
 </CardDescription>
 </div>
 <button 
 className="text-muted-foreground hover:text-foreground text-xl font-medium leading-none focus:outline-none"
 onClick={() => setSelectedBrand(null)}
 >
 &times;
 </button>
 </div>

 <div className="space-y-2.5">
 {ROLES.map((role) => (
 <button
 key={role.id}
 className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:bg-indigo-500/5 hover:border-indigo-500/30 text-left transition-all duration-200 group"
 onClick={() => handleRoleSelect(role.id)}
 >
 <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm border border-border group-hover:scale-105 transition-transform duration-200">
 {role.icon}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-bold text-foreground group-hover:text-muted-foreground">
 {role.name}
 </div>
 <div className="text-[10px] text-muted-foreground leading-normal mt-0.5">
 {role.desc}
 </div>
 </div>
 <div className="text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
 &rarr;
 </div>
 </button>
 ))}
 </div>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
}
