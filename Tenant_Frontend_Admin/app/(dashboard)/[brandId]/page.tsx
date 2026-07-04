"use client";

import { useEffect, useState } from"react";
import { useParams } from"next/navigation";
import Link from"next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Button } from"@/components/ui/Button";
import { Badge } from"@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from"@/components/ui/Table";
import { 
 AdminProductAPI, 
 AdminLicenseAPI, 
 AdminDesktopLicenseAPI, 
 AdminSettingsAPI,
 AdminBlogAPI
} from"@/services/api";
import { Product } from"@/types/product";
import { LicenseKey, DesktopLicense } from"@/types/license";
import { BlogPost } from"@/types/blog";
import { AuthService } from"@/services/auth";

export default function BrandDashboardPage() {
 const params = useParams();
 const brandId = (params?.brandId as string) ||"";

 const [loading, setLoading] = useState(true);
 const [brandName, setBrandName] = useState("");
 const [brandTagline, setBrandTagline] = useState("");
 const [productCount, setProductCount] = useState(0);
 const [desktopLicCount, setDesktopLicCount] = useState(0);
 const [webLicCount, setWebLicCount] = useState(0);
 const [seoScore, setSeoScore] = useState(0);
 
 const [recentLicenses, setRecentLicenses] = useState<{ id: string; type: string; key: string; date: string; status: string }[]>([]);
 const [recentProducts, setRecentProducts] = useState<Product[]>([]);
 const [userRole, setUserRole] = useState("");

 const isSuperAdmin = userRole ==="SUPER_ADMIN" || userRole ==="OWNER";
 const isAdmin = userRole ==="ADMIN";
 const isLicenseAdmin = isSuperAdmin || isAdmin || userRole ==="LICENSE_ADMIN";
 const isBrandManager = isSuperAdmin || isAdmin || userRole ==="BRAND_MANAGER" || userRole ==="SEO";
 const canManageProducts = isSuperAdmin || userRole ==="SEO" || userRole ==="SEO_CW_PRODUCT_MANAGER" || userRole ==="PRODUCT_MANAGER" || userRole ==="WRITER";
 const canManageSeo = isSuperAdmin || userRole ==="SEO" || userRole ==="SEO_CW_PRODUCT_MANAGER" || userRole ==="CONTENT_SEO_MANAGER";

 useEffect(() => {
 async function loadDashboardData() {
 try {
 setLoading(true);

 const session = AuthService.getSession();
 const role = session?.role ||"";
 setUserRole(role);

 const isSuperAdminCheck = role ==="SUPER_ADMIN" || role ==="OWNER";
 const isAdminCheck = role ==="ADMIN";
 const isLicenseAdminCheck = isSuperAdminCheck || isAdminCheck || role ==="LICENSE_ADMIN";

 const [settings, products, desktopLic, webLic, blogs] = await Promise.all([
 AdminSettingsAPI.get().catch(() => ({ name: brandId.toUpperCase(), tagline:"Software Management Console" })),
 AdminProductAPI.getAll().catch(() => [] as Product[]),
 isLicenseAdminCheck ? AdminDesktopLicenseAPI.getAll().catch(() => [] as DesktopLicense[]) : Promise.resolve([] as DesktopLicense[]),
 isLicenseAdminCheck ? AdminLicenseAPI.getAll().catch(() => [] as LicenseKey[]) : Promise.resolve([] as LicenseKey[]),
 AdminBlogAPI.getAll().catch(() => [] as BlogPost[])
 ]);

 // Brand details
 setBrandName(settings.name || brandId.toUpperCase());
 setBrandTagline(settings.tagline ||"Software Management Console");

 // Filter components by brand
 const brandProducts = products.filter((p: Product) => p.siteId === brandId);
 const brandBlogs = blogs.filter((b: BlogPost) => b.siteId === brandId);
 const brandDesktop = desktopLic.filter((d: DesktopLicense) => d.siteId === brandId);
 const brandWeb = webLic.filter((w: LicenseKey) => w.siteId === brandId);

 setProductCount(brandProducts.length);
 setDesktopLicCount(brandDesktop.length);
 setWebLicCount(brandWeb.length);

 // Calculate SEO completeness score
 const totalItems = brandProducts.length + brandBlogs.length;
 if (totalItems > 0) {
 let filledCount = 0;
 brandProducts.forEach((p) => {
 if (p.seo?.title && p.seo?.description) filledCount++;
 });
 brandBlogs.forEach((b) => {
 if (b.seo?.title && b.seo?.description) filledCount++;
 });
 setSeoScore(Math.round((filledCount / totalItems) * 100));
 } else {
 setSeoScore(100);
 }

 // Recent licenses list
 const recD: any[] = brandDesktop.slice(0, 3).map(x => ({
 id:`d-${x.id}`,
 type:"Desktop App",
 key: x.licenseKey,
 date: new Date(x.createdAt || Date.now()).toLocaleDateString(),
 status: x.status ==="REVOKED" ?"Revoked" :"Active"
 }));
 const recW: any[] = brandWeb.slice(0, 3).map(x => ({
 id:`w-${x.id}`,
 type:"Web/SaaS",
 key: x.activationKey,
 date: new Date(x.createdAt || Date.now()).toLocaleDateString(),
 status: x.status ==="REVOKED" ?"Revoked" :"Active"
 }));
 setRecentLicenses([...recD, ...recW].slice(0, 5));

 // Recent products list
 setRecentProducts(brandProducts.slice(0, 5));

 } catch (err) {
 console.error("Failed to load dashboard statistics", err);
 } finally {
 setLoading(false);
 }
 }

 loadDashboardData();
 }, [brandId]);

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[50vh] text-xs font-semibold text-zinc-500">
 <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 <span>Loading workspace analytics...</span>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-fade-in">
 {/* Header Banner */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 pb-6">
 <div>
 <h2 className="text-xl font-bold tracking-tight text-zinc-900">{brandName} Overview</h2>
 <p className="text-xs text-zinc-500 mt-1">{brandTagline}</p>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase py-1 border-indigo-200 bg-indigo-50/10 text-indigo-600">
 Active Storefront
 </Badge>
 <span className="text-xs text-zinc-400 font-medium">Updated: {new Date().toLocaleDateString()}</span>
 </div>
 </div>

 {/* Metrics Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Metric 1 */}
 <Card className="bg-white border-zinc-200 shadow-xs">
 <CardHeader className="pb-2">
 <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Products Catalog</CardDescription>
 <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">{productCount}</CardTitle>
 </CardHeader>
 <CardContent className="h-10 flex items-end">
 <svg className="w-full h-8 text-indigo-500" viewBox="0 0 100 30" preserveAspectRatio="none">
 <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,20 15,18 30,25 45,15 60,10 75,18 90,8 100,5" />
 </svg>
 </CardContent>
 </Card>

 {/* Metric 2 */}
 {isLicenseAdmin && (
 <Card className="bg-white border-zinc-200 shadow-xs">
 <CardHeader className="pb-2">
 <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Desktop Licenses</CardDescription>
 <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">{desktopLicCount}</CardTitle>
 </CardHeader>
 <CardContent className="h-10 flex items-end">
 <svg className="w-full h-8 text-emerald-500" viewBox="0 0 100 30" preserveAspectRatio="none">
 <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,25 15,22 30,12 45,18 60,8 75,12 90,5 100,2" />
 </svg>
 </CardContent>
 </Card>
 )}

 {/* Metric 3 */}
 {isLicenseAdmin && (
 <Card className="bg-white border-zinc-200 shadow-xs">
 <CardHeader className="pb-2">
 <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">SaaS Licenses</CardDescription>
 <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">{webLicCount}</CardTitle>
 </CardHeader>
 <CardContent className="h-10 flex items-end">
 <svg className="w-full h-8 text-amber-500" viewBox="0 0 100 30" preserveAspectRatio="none">
 <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,22 15,25 30,18 45,12 60,15 75,5 90,8 100,3" />
 </svg>
 </CardContent>
 </Card>
 )}

 {/* Metric 4 */}
 <Card className="bg-white border-zinc-200 shadow-xs">
 <CardHeader className="pb-2">
 <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">SEO Score</CardDescription>
 <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">{seoScore}%</CardTitle>
 </CardHeader>
 <CardContent className="h-10 flex items-center justify-between">
 <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
 <div 
 className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
 style={{ width:`${seoScore}%` }} 
 />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Main Two-Column Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Left Side: Recent Licenses & Products */}
 <div className="lg:col-span-2 space-y-6">
 {isLicenseAdmin && (
 <Card className="bg-white border-zinc-200">
 <CardHeader className="border-b border-border pb-4">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-sm font-bold text-zinc-900">Recent Licenses Issued</CardTitle>
 <CardDescription className="text-[10px] text-zinc-500 mt-0.5">Timeline of recent activation credentials.</CardDescription>
 </div>
 <Link href={`/${brandId}/admin`}>
 <Button variant="outline" size="sm" className="text-[10px] h-7 px-2.5">Manage keys</Button>
 </Link>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {recentLicenses.length === 0 ? (
 <div className="p-6 text-center text-xs text-zinc-500 font-medium">No license keys generated recently.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow className="hover:bg-transparent">
 <TableHead className="py-2 text-[10px]">Type</TableHead>
 <TableHead className="py-2 text-[10px]">License Key</TableHead>
 <TableHead className="py-2 text-[10px]">Date Issued</TableHead>
 <TableHead className="py-2 text-[10px]">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {recentLicenses.map((lic) => (
 <TableRow key={lic.id} className="hover:bg-card/50">
 <TableCell className="py-2.5 font-medium text-xs text-zinc-800">{lic.type}</TableCell>
 <TableCell className="py-2.5 font-mono text-[11px] tracking-tight text-zinc-900">
 {lic.key.substring(0, 18)}...
 </TableCell>
 <TableCell className="py-2.5 text-xs text-zinc-400">{lic.date}</TableCell>
 <TableCell className="py-2.5 text-xs">
 <Badge 
 variant={lic.status ==="Active" ?"success" :"destructive"} 
 className="text-[9px] px-1.5 py-0"
 >
 {lic.status}
 </Badge>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </CardContent>
 </Card>
 )}

 <Card className="bg-white border-zinc-200">
 <CardHeader className="border-b border-border pb-4">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-sm font-bold text-zinc-900">Catalog Snapshot</CardTitle>
 <CardDescription className="text-[10px] text-zinc-500 mt-0.5">Top products inside this brand registry.</CardDescription>
 </div>
 <Link href={`/${brandId}/cc`}>
 <Button variant="outline" size="sm" className="text-[10px] h-7 px-2.5">Edit Catalog</Button>
 </Link>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {recentProducts.length === 0 ? (
 <div className="p-6 text-center text-xs text-zinc-500 font-medium">No products added yet.</div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow className="hover:bg-transparent">
 <TableHead className="py-2 text-[10px]">Product Name</TableHead>
 <TableHead className="py-2 text-[10px]">Category</TableHead>
 <TableHead className="py-2 text-[10px]">Price</TableHead>
 <TableHead className="py-2 text-[10px]">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {recentProducts.map((prod) => (
 <TableRow key={prod.id} className="hover:bg-card/50">
 <TableCell className="py-2.5 font-medium text-xs text-zinc-800">{prod.name}</TableCell>
 <TableCell className="py-2.5 text-xs text-zinc-400 capitalize">{prod.category.replace("-","")}</TableCell>
 <TableCell className="py-2.5 text-xs font-semibold text-zinc-900">${prod.price}</TableCell>
 <TableCell className="py-2.5 text-xs">
 <Badge 
 variant={prod.enabled ?"success" :"secondary"} 
 className="text-[9px] px-1.5 py-0"
 >
 {prod.enabled ?"Live" :"Draft"}
 </Badge>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Right Side: Quick Actions & Management */}
 <div className="space-y-6">
 <Card className="bg-white border-zinc-200">
 <CardHeader className="pb-3 border-b border-border">
 <CardTitle className="text-sm font-bold text-zinc-900">Quick Workspace Actions</CardTitle>
 <CardDescription className="text-[10px] text-zinc-500 mt-0.5">Instant redirects to administrative sections.</CardDescription>
 </CardHeader>
 <CardContent className="pt-4 space-y-3">
 {canManageProducts && (
 <Link href={`/${brandId}/cc?action=new-product`} className="block">
 <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-150 hover:bg-card transition-colors select-none">
 <div className="w-8 h-8 rounded bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
 📦
 </div>
 <div>
 <h4 className="text-xs font-bold text-zinc-800">Add New Product</h4>
 <p className="text-[9px] text-zinc-500 mt-0.5">Insert new items, features, pricing grids.</p>
 </div>
 </div>
 </Link>
 )}

 {isLicenseAdmin && (
 <Link href={`/${brandId}/admin?action=generate`} className="block">
 <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-150 hover:bg-card transition-colors select-none">
 <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0">
 🔑
 </div>
 <div>
 <h4 className="text-xs font-bold text-zinc-800">Issue License Key</h4>
 <p className="text-[9px] text-zinc-500 mt-0.5">Create standard desktop or SaaS web tokens.</p>
 </div>
 </div>
 </Link>
 )}

 {canManageSeo && (
 <Link href={`/${brandId}/seo`} className="block">
 <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-150 hover:bg-card transition-colors select-none">
 <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm font-bold shrink-0">
 🔍
 </div>
 <div>
 <h4 className="text-xs font-bold text-zinc-800">Audit SEO Settings</h4>
 <p className="text-[9px] text-zinc-500 mt-0.5">Improve search crawler indexation rates.</p>
 </div>
 </div>
 </Link>
 )}

 {isBrandManager && (
 <Link href={`/${brandId}/brand`} className="block">
 <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-150 hover:bg-card transition-colors select-none">
 <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-650 flex items-center justify-center text-sm font-bold shrink-0">
 ⚙️
 </div>
 <div>
 <h4 className="text-xs font-bold text-zinc-800">Edit Settings</h4>
 <p className="text-[9px] text-zinc-500 mt-0.5">Reconfigure themes, announcements, legalities.</p>
 </div>
 </div>
 </Link>
 )}
 </CardContent>
 </Card>
 </div>

 </div>
 </div>
 );
}
