"use client";

import { useEffect, useState, Suspense } from"react";
import { useSearchParams, useRouter } from"next/navigation";
import { AdminOwnerAPI } from"@/services/api";
import { AuthService } from"@/services/auth";
import { ROLE_NAV_REGISTRY } from"@/app/(dashboard)/layout";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from"@/components/ui/Table";
import { Input } from"@/components/ui/Input";
import { Select } from"@/components/ui/Select";
import { Badge } from"@/components/ui/Badge";

const ROLE_LABELS: Record<string, string> = {
 SUPER_ADMIN:"Super Admin (Global)",
 ADMIN:"Administrator (All Access)",
 SEO_CW_PRODUCT_MANAGER:"SEO/CW & Product Manager",
 OWNER:"Super Admin (Legacy)",
 BRAND_MANAGER:"Brand Manager (Legacy)",
 PRODUCT_MANAGER:"Product Manager (Legacy)",
 CONTENT_SEO_MANAGER:"Content & SEO Manager (Legacy)",
 LICENSE_ADMIN:"License Admin (Legacy)",
 SEO:"SEO Admin (Legacy)",
 WRITER:"Writer (Legacy)",
};

interface UserCredentials {
 username: string;
 password: string;
 role: string;
 brandId: string;
 fullName: string;
 email: string;
}

function OwnerPanelPageContent() {
 const [users, setUsers] = useState<UserCredentials[]>([]);
 const [activeBrands, setActiveBrands] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);

 // Form State
 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const [role, setRole] = useState("SEO_CW_PRODUCT_MANAGER");
 const [brandId, setBrandId] = useState("brandA");
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [submitting, setSubmitting] = useState(false);

 // Password masking state
 const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
 
 const searchParams = useSearchParams();
 const router = useRouter();
 const filterParam = searchParams.get("filter");
 const selectedBrandFilter = filterParam;

 useEffect(() => {
 import("@/services/api").then(({ BrandAPI }) => {
 BrandAPI.getActiveBrands().then(setActiveBrands).catch(console.error);
 });
 loadUsers();
 }, []);

 // Set brandId automatically if role is SUPER_ADMIN or OWNER
 useEffect(() => {
 if (role ==="SUPER_ADMIN" || role ==="OWNER") {
 setBrandId("all");
 } else if (brandId ==="all") {
 setBrandId("brandA");
 }
 }, [role]);

 async function loadUsers() {
 try {
 setLoading(true);
 setError(null);
 const data = await AdminOwnerAPI.getCredentials();
 setUsers(data);
 } catch (err: any) {
 setError("Failed to fetch user credentials:" + err.message);
 } finally {
 setLoading(false);
 }
 }

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 const isEdit = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
 
 if (!username.trim()) {
 setError("Username is required");
 return;
 }
 if (!isEdit && !password.trim()) {
 setError("Password is required for new accounts");
 return;
 }

 setSubmitting(true);
 setError(null);
 setSuccess(null);

 try {
 const payload = {
 username: username.trim(),
 password: password.trim(),
 role,
 brandId,
 fullName: fullName.trim(),
 email: email.trim(),
 };
 await AdminOwnerAPI.saveCredentials(payload);
 setSuccess(`Successfully saved credentials for user"${username}"`);
 setUsername("");
 setPassword("");
 setRole("SEO_CW_PRODUCT_MANAGER");
 setBrandId("brandA");
 setFullName("");
 setEmail("");
 loadUsers();
 } catch (err: any) {
 setError("Failed to save credentials:" + err.message);
 } finally {
 setSubmitting(false);
 }
 }

 async function handleDelete(targetUsername: string) {
 if (targetUsername ==="owner") {
 setError("Cannot delete the root owner account");
 return;
 }
 if (!confirm(`Are you sure you want to delete user"${targetUsername}"?`)) {
 return;
 }

 setError(null);
 setSuccess(null);

 try {
 await AdminOwnerAPI.deleteCredentials(targetUsername);
 setSuccess(`Successfully deleted user"${targetUsername}"`);
 loadUsers();
 } catch (err: any) {
 setError("Failed to delete user:" + err.message);
 }
 }

 function handleEdit(user: UserCredentials) {
 setUsername(user.username);
 setPassword(user.password);
 setRole(user.role);
 setBrandId(user.brandId);
 setFullName(user.fullName ||"");
 setEmail(user.email ||"");
 }

 function togglePassword(uname: string) {
 setRevealedPasswords((prev) => ({
 ...prev,
 [uname]: !prev[uname],
 }));
 }

 // Calculate brand associations dynamically
 const brandStats: Record<string, number> = {
 global: users.filter(u => u.brandId ==="all" || u.role ==="OWNER").length,
 };
 users.forEach(u => {
 if (u.brandId !=="all" && u.role !=="OWNER") {
 brandStats[u.brandId] = (brandStats[u.brandId] || 0) + 1;
 }
 });

 return (
 <div className="space-y-6 w-full">
 <div className="flex flex-col gap-1">
 <h1 className="text-xl font-bold tracking-tight text-zinc-900">Super Admin Credentials Panel</h1>
 <p className="text-xs text-zinc-500 font-medium">Create and manage logins, assigning roles and brand isolations.</p>
 </div>

 {error && (
 <div className="flex items-center gap-3 p-3.5 rounded-lg border border-red-200 bg-red-50/50 text-xs font-semibold text-red-600 animate-fade-in">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
 <circle cx="12" cy="12" r="10" />
 <line x1="12" y1="8" x2="12" y2="12" />
 <line x1="12" y1="16" x2="12.01" y2="16" />
 </svg>
 <span>{error}</span>
 </div>
 )}

 {success && (
 <div className="flex items-center gap-3 p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-600 animate-fade-in">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
 <polyline points="20 6 9 17 4 12" />
 </svg>
 <span>{success}</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
 {/* User Form Card */}
 <Card className=" shadow-sm border border-zinc-200">
 <CardHeader className="pb-4">
 <CardTitle>Manage Account</CardTitle>
 <CardDescription>Enter details to add or edit user logins.</CardDescription>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-1.5">
 <label htmlFor="username" className="text-xs font-semibold text-zinc-500">Username</label>
 <Input
 id="username"
 type="text"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 placeholder="e.g. writerA"
 required
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="password" className="text-xs font-semibold text-zinc-500">Password</label>
 <Input
 id="password"
 type="text"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder={users.some(u => u.username.toLowerCase() === username.trim().toLowerCase()) ?"•••••••• (Optional to change)" :"Password"}
 required={!users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())}
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="fullName" className="text-xs font-semibold text-zinc-500">Full Name</label>
 <Input
 id="fullName"
 type="text"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 placeholder="e.g. John Doe"
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="email" className="text-xs font-semibold text-zinc-500">Email Address</label>
 <Input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="e.g. john@example.com"
 />
 </div>

 <div className="space-y-1.5">
 <label htmlFor="role" className="text-xs font-semibold text-zinc-500">Role Scope</label>
 <Select
 id="role"
 value={role}
 onChange={(e) => setRole(e.target.value)}
 >
 {["SUPER_ADMIN","ADMIN","SEO_CW_PRODUCT_MANAGER"].map((r) => (
 <option key={r} value={r}>
 {ROLE_LABELS[r] || r.replace(/_/g,"")}
 </option>
 ))}
 </Select>
 </div>

 <div className="space-y-1.5">
 <label htmlFor="brandId" className="text-xs font-semibold text-zinc-500">Brand Scope</label>
 <Select
 id="brandId"
 value={brandId}
 onChange={(e) => setBrandId(e.target.value)}
 disabled={role ==="SUPER_ADMIN" || role ==="OWNER"}
 >
 {role ==="SUPER_ADMIN" || role ==="OWNER" ? (
 <option value="all">Global Access (all)</option>
 ) : (
 <>
 {activeBrands.length > 0 ? (
 activeBrands.map(b => (
 <option key={b.id} value={b.id}>{b.name} {b.devPort ?`(Port ${b.devPort})` : ''}</option>
 ))
 ) : (
 <option value="brandA">Loading brands...</option>
 )}
 </>
 )}
 </Select>
 </div>

 <Button type="submit" disabled={submitting} className="w-full justify-center mt-6">
 {submitting ? (
 <span className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin" />
 ) : (
 <>
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
 <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
 <polyline points="17 21 17 13 7 13 7 21" />
 <polyline points="7 3 7 8 15 8" />
 </svg>
 Save Credentials
 </>
 )}
 </Button>
 </form>
 </CardContent>
 </Card>

 {/* User List Card */}
 <Card className=" shadow-sm border border-zinc-200 overflow-hidden">
 <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-zinc-150">
 <div>
 <CardTitle>Registered Accounts</CardTitle>
 <CardDescription>All active logins within the selected scope.</CardDescription>
 </div>
 {selectedBrandFilter && (
 <Button
 variant="destructive"
 size="sm"
 onClick={() => router.push("/owner")}
 className="text-xs h-7 px-2.5"
 >
 Clear Filter ({selectedBrandFilter ==="all" ?"Global" : selectedBrandFilter}) ×
 </Button>
 )}
 </CardHeader>
 <CardContent className="p-0">
 {loading ? (
 <div className="flex justify-center items-center py-16">
 <span className="w-8 h-8 rounded-full border-3 border-zinc-200 border-t-blue-500 animate-spin" />
 </div>
 ) : (
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Username</TableHead>
 <TableHead>Full Name</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Password</TableHead>
 <TableHead>Role</TableHead>
 <TableHead>Scope</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {users.filter(u => {
 if (!selectedBrandFilter) return true;
 if (selectedBrandFilter ==="all") return u.brandId ==="all" || u.role ==="SUPER_ADMIN" || u.role ==="OWNER";
 return u.brandId === selectedBrandFilter;
 }).map((user) => (
 <TableRow key={user.username}>
 <TableCell className="font-semibold text-zinc-900">
 <span className="bg-muted border border-zinc-205 px-2 py-1 rounded-md text-xs font-mono">{user.username}</span>
 </TableCell>
 <TableCell className="font-medium">{user.fullName ||"N/A"}</TableCell>
 <TableCell className="text-zinc-500 text-xs">{user.email ||"N/A"}</TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <span className="font-mono text-zinc-400 text-xs select-none">
 {revealedPasswords[user.username] ? (user.password ||"(Encrypted)") :"••••••••"}
 </span>
 <button
 type="button"
 className="text-zinc-400 hover:text-zinc-900 p-1 rounded transition-colors cursor-pointer border-0 bg-transparent"
 onClick={() => togglePassword(user.username)}
 title={revealedPasswords[user.username] ?"Hide password" :"Show password"}
 >
 {revealedPasswords[user.username] ? (
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
 <line x1="1" y1="1" x2="23" y2="23" />
 </svg>
 ) : (
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
 <circle cx="12" cy="12" r="3" />
 </svg>
 )}
 </button>
 </div>
 </TableCell>
 <TableCell>
 <Badge 
 variant={
 user.role ==="SUPER_ADMIN" || user.role ==="OWNER"
 ?"warning"
 : user.role ==="ADMIN"
 ?"default"
 :"success"
 } 
 className="text-[9px] px-1.5 py-0"
 >
 {user.role}
 </Badge>
 </TableCell>
 <TableCell className="text-zinc-500 font-mono text-xs">{user.brandId}</TableCell>
 <TableCell className="text-right">
 <div className="flex items-center justify-end gap-1.5">
 <Button
 variant="outline"
 size="icon"
 className="w-7 h-7 text-zinc-500 hover:text-foreground"
 onClick={() => handleEdit(user)}
 title="Edit credentials"
 >
 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
 </svg>
 </Button>
 <Button
 variant="outline"
 size="icon"
 className="w-7 h-7 text-zinc-500 hover:text-red-600"
 onClick={() => handleDelete(user.username)}
 disabled={user.username ==="owner"}
 title="Delete credentials"
 >
 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
 </svg>
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

export default function OwnerPanelPage() {
 return (
 <Suspense fallback={
 <div className="flex justify-center items-center py-20">
 <span className="w-8 h-8 rounded-full border-3 border-zinc-200 border-t-blue-500 animate-spin" />
 </div>
 }>
 <OwnerPanelPageContent />
 </Suspense>
 );
}
