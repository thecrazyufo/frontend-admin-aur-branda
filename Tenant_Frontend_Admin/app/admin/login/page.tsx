"use client";

import { useState, FormEvent, useEffect, Suspense } from"react";
import { useRouter, useSearchParams } from"next/navigation";
import Link from"next/link";
import { AuthService } from"@/services/auth";
import { ROLE_NAV_REGISTRY } from"@/app/(dashboard)/layout";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Input } from"@/components/ui/Input";

function AdminLoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [showPass, setShowPass] = useState(false);

 function getRedirectPath(role: string, brandId: string): string {
 const allowed = ROLE_NAV_REGISTRY[role];
 if (allowed && allowed.length > 0) {
 if (role ==="OWNER" || role ==="SUPER_ADMIN") return allowed[0].path;
 return`/${brandId}${allowed[0].path}`;
 }
 return"/admin/login";
 }

 useEffect(() => {
 // If already logged in, redirect to matching role route
 const session = AuthService.getSession();
 if (session) {
 router.replace(getRedirectPath(session.role, session.brandId));
 }
 }, [router]);

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 setError(null);
 setLoading(true);

 try {
 const session = await AuthService.login(username, password);
 // Also set cookie so middleware can verify (expires in 24h)
 const expires = new Date(session.expiresAt).toUTCString();
 document.cookie =`admin_jwt=${session.token}; path=/; expires=${expires}; SameSite=Strict`;

 const redirectUrl = getRedirectPath(session.role, session.brandId);
 router.replace(redirectUrl);
 } catch {
 setError("Invalid username or password. Please try again.");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="relative min-h-screen bg-background flex items-center justify-center py-16 px-4 font-sans overflow-hidden">
 {/* Background Glow */}
 <div className="absolute inset-0 pointer-events-none z-0">
 <div className="absolute -top-[10%] -left-[10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
 <div className="absolute -bottom-[10%] -right-[10%] w-[30rem] h-[30rem] rounded-full bg-violet-500/5 blur-[100px] animate-pulse" style={{ animationDelay:"2s" }} />
 </div>

 <Card className="w-full max-w-sm border-border p-6 z-10 shadow-2xl shadow-black/80 backdrop-blur-md">
 {/* Logo / Brand */}
 <div className="flex items-center gap-2 mb-6">
 <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
 <rect width="32" height="32" rx="6" fill="url(#grad)" />
 <path d="M8 16L13 21L24 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
 <defs>
 <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
 <stop offset="0%" stopColor="#6366f1" />
 <stop offset="100%" stopColor="#8b5cf6" />
 </linearGradient>
 </defs>
 </svg>
 <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Admin Portal</span>
 </div>

 <div className="mb-6">
  <h1 className="text-xl font-extrabold tracking-tight text-foreground">Admin Panel</h1>
  <p className="text-xs text-muted-foreground mt-1">Sign in to manage your platform</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
  <div className="space-y-1.5">
  <label htmlFor="admin-username" className="text-xs font-medium text-muted-foreground">Username</label>
  <div className="relative flex items-center">
  <svg className="absolute left-3 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
  </svg>
  <Input
  id="admin-username"
  type="text"
  className="pl-9 h-10 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
  autoComplete="username"
  autoFocus
 />
 </div>
 </div>

  <div className="space-y-1.5">
  <label htmlFor="admin-password" className="text-xs font-medium text-muted-foreground">Password</label>
  <div className="relative flex items-center">
  <svg className="absolute left-3 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
  <Input
  id="admin-password"
  type={showPass ?"text" :"password"}
  className="pl-9 pr-9 h-10 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  autoComplete="current-password"
 />
 <button
 type="button"
 className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
 onClick={() => setShowPass(!showPass)}
 tabIndex={-1}
 aria-label="Toggle password visibility"
 >
 {showPass ? (
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
 <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
 <line x1="1" y1="1" x2="23" y2="23"/>
 </svg>
 ) : (
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
 <circle cx="12" cy="12" r="3"/>
 </svg>
 )}
 </button>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg p-2.5 text-xs text-red-400">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
 <circle cx="12" cy="12" r="10"/>
 <line x1="12" y1="8" x2="12" y2="12"/>
 <line x1="12" y1="16" x2="12.01" y2="16"/>
 </svg>
 <span>{error}</span>
 </div>
 )}

 <Button
 id="admin-login-btn"
 type="submit"
 className="w-full h-10 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
 disabled={loading}
 >
 {loading ? (
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <span className="flex items-center justify-center gap-1.5">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
 <polyline points="10 17 15 12 10 7"/>
 <line x1="15" y1="12" x2="3" y2="12"/>
 </svg>
 Sign In
 </span>
 )}
 </Button>
 </form>

  <p className="text-center text-[10px] text-muted-foreground mt-6 select-none">
  Secure admin access · JWT authenticated · 24h session
  </p>
 </Card>
 </div>
 );
}

export default function AdminLoginPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-background flex items-center justify-center text-xs font-semibold text-zinc-500">
 Loading secure workspace login...
 </div>
 }>
 <AdminLoginForm />
 </Suspense>
 );
}
