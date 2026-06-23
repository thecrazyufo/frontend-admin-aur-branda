"use client";

import { useEffect, useState, FormEvent, Fragment } from "react";
import { useParams } from "next/navigation";
import { AdminLicenseAPI, AdminDesktopLicenseAPI, AdminProductAPI } from "@/services/api";
import { LicenseKey, DesktopLicense } from "@/types/license";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export default function BrandLicensesPage() {
  const params = useParams();
  const brandId = (params?.brandId as string) || "";

  // Tabs
  const [activeTab, setActiveTab] = useState<"desktop" | "web">("desktop");

  // Data state
  const [desktopLicenses, setDesktopLicenses] = useState<DesktopLicense[]>([]);
  const [webLicenses, setWebLicenses] = useState<LicenseKey[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading & status
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Expanded details rows
  const [expandedRow, setExpandedRow] = useState<{ type: "desktop" | "web"; id: string | number } | null>(null);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Brand Prefix Mapping
  const brandPrefixMap: Record<string, string> = {
    brandA: "PST",
    brandB: "PSTB",
    brandC: "PSTC",
    brandD: "PSTD",
    brandE: "PSTE",
  };
  const activePrefix = brandPrefixMap[brandId] || "PST";

  // Form states
  const [webForm, setWebForm] = useState({
    productId: "",
    pricingTierName: "Standard",
    customerEmail: "",
    orderId: "",
    maxDevices: 1,
    durationMonths: 12,
  });

  const [desktopForm, setDesktopForm] = useState({
    brandPrefix: activePrefix,
    licenseType: "STANDARD",
    maxActivations: 3,
    durationMonths: 12,
  });

  useEffect(() => {
    setDesktopForm(prev => ({ ...prev, brandPrefix: activePrefix }));
  }, [brandId, activePrefix]);

  // Load licenses and products
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const [desktopList, webList, productList] = await Promise.all([
          AdminDesktopLicenseAPI.getAll(),
          AdminLicenseAPI.getAll(),
          AdminProductAPI.getAll().catch(() => [] as Product[])
        ]);
        
        // Filter elements by siteId/brand scope
        setDesktopLicenses(desktopList.filter(x => x.siteId === brandId));
        setWebLicenses(webList.filter(x => x.siteId === brandId));
        
        const filteredProducts = productList.filter(x => x.siteId === brandId);
        setProducts(filteredProducts);
        
        if (filteredProducts.length > 0) {
          setWebForm(prev => ({ ...prev, productId: filteredProducts[0].id! }));
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load licenses data from the database.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [brandId]);

  function showNotification(msg: string, type: "success" | "error" = "success") {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  }

  // Action Handlers for Web licenses
  async function handleWebRevoke(id: string) {
    try {
      setActionLoading(`web-revoke-${id}`);
      const updated = await AdminLicenseAPI.revoke(id);
      setWebLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("License key revoked successfully.");
    } catch {
      showNotification("Failed to revoke license.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleWebReactivate(id: string) {
    try {
      setActionLoading(`web-reactivate-${id}`);
      const updated = await AdminLicenseAPI.reactivate(id);
      setWebLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("License key reactivated successfully.");
    } catch {
      showNotification("Failed to reactivate license.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleWebReset(id: string) {
    if (!confirm("Are you sure you want to reset all active devices for this license?")) return;
    try {
      setActionLoading(`web-reset-${id}`);
      const updated = await AdminLicenseAPI.resetActivations(id);
      setWebLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("Active devices reset successfully.");
    } catch {
      showNotification("Failed to reset activations.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // Action Handlers for Desktop licenses
  async function handleDesktopRevoke(id: number) {
    try {
      setActionLoading(`desktop-revoke-${id}`);
      const updated = await AdminDesktopLicenseAPI.revoke(id);
      setDesktopLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("Desktop license key revoked successfully.");
    } catch {
      showNotification("Failed to revoke desktop license.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDesktopReactivate(id: number) {
    try {
      setActionLoading(`desktop-reactivate-${id}`);
      const updated = await AdminDesktopLicenseAPI.reactivate(id);
      setDesktopLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("Desktop license key reactivated successfully.");
    } catch {
      showNotification("Failed to reactivate desktop license.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDesktopReset(id: number) {
    if (!confirm("Are you sure you want to clear all machine activations for this desktop license?")) return;
    try {
      setActionLoading(`desktop-reset-${id}`);
      const updated = await AdminDesktopLicenseAPI.resetActivations(id);
      setDesktopLicenses(prev => prev.map(item => item.id === id ? updated : item));
      showNotification("Desktop machine activations cleared successfully.");
    } catch {
      showNotification("Failed to reset desktop activations.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // Submit generators
  async function handleGenerateWebLicense(e: FormEvent) {
    e.preventDefault();
    try {
      setActionLoading("generate-web");
      const generated = await AdminLicenseAPI.generate(webForm);
      setWebLicenses(prev => [generated, ...prev]);
      setShowGenerateModal(false);
      showNotification("Web Platform License key generated: " + generated.activationKey);
      
      setWebForm(prev => ({
        ...prev,
        customerEmail: "",
        orderId: "",
        maxDevices: 1,
      }));
    } catch (err) {
      console.error(err);
      showNotification("Failed to generate license key. Verify input parameters.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerateDesktopLicense(e: FormEvent) {
    e.preventDefault();
    try {
      setActionLoading("generate-desktop");
      const generated = await AdminDesktopLicenseAPI.generate(desktopForm);
      setDesktopLicenses(prev => [generated, ...prev]);
      setShowGenerateModal(false);
      showNotification("Desktop license key generated: " + generated.licenseKey);
    } catch (err) {
      console.error(err);
      showNotification("Failed to generate desktop license key.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Lifetime";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  }

  function getProductName(id: string) {
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : `Product ID: ${id}`;
  }

  function toggleRow(type: "desktop" | "web", id: string | number) {
    if (expandedRow?.type === type && expandedRow?.id === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow({ type, id });
    }
  }

  // Filtering lists
  const filteredWebLicenses = webLicenses.filter(lic => {
    const matchesSearch = 
      lic.activationKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(lic.productId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || lic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDesktopLicenses = desktopLicenses.filter(lic => {
    const matchesSearch = 
      lic.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.licenseType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || lic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Licenses Manager</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Issue and validate software license keys for brand:{" "}
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
              {brandId}
            </span>
          </p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} size="sm" className="h-9 px-4 gap-1.5 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Issue License Key
        </Button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 w-fit select-none">
        <button 
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
            activeTab === "desktop"
              ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          )}
          onClick={() => { setActiveTab("desktop"); setExpandedRow(null); }}
        >
          💻 Desktop App Licenses ({desktopLicenses.length})
        </button>
        <button 
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 bg-transparent",
            activeTab === "web"
              ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          )}
          onClick={() => { setActiveTab("web"); setExpandedRow(null); }}
        >
          🛒 Web & SaaS Licenses ({webLicenses.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 mb-4">
        <div className="flex-1">
          <Input 
            type="text" 
            placeholder={activeTab === "desktop" ? "Search by key, type..." : "Search by key, customer email, order ID..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="REVOKED">Revoked Only</option>
            <option value="EXPIRED">Expired Only</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500 dark:text-zinc-400">
          <span className="w-8 h-8 rounded-full border-3 border-zinc-205 border-t-blue-500 animate-spin" />
          <span className="text-xs font-semibold">Loading license database...</span>
        </div>
      ) : (
        <Card className="dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "desktop" ? (
              /* DESKTOP LICENSES TABLE */
              filteredDesktopLicenses.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No desktop licenses found matching your filters.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: "40px" }}></TableHead>
                      <TableHead>License Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Device Activations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right" style={{ width: "240px" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDesktopLicenses.map((lic) => {
                      const isExpanded = expandedRow?.type === "desktop" && expandedRow?.id === lic.id;
                      const usedCount = lic.activations?.length || 0;
                      
                      return (
                        <Fragment key={lic.id}>
                          <TableRow className={cn(isExpanded && "bg-zinc-50/30 dark:bg-zinc-900/10")}>
                            <TableCell>
                              <button 
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold border-0 bg-transparent cursor-pointer select-none text-[10px]" 
                                onClick={() => toggleRow("desktop", lic.id)}
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">{lic.licenseKey}</code>
                            </TableCell>
                            <TableCell>
                              <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">{lic.licenseType}</span>
                            </TableCell>
                            <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{formatDate(lic.expiresAt)}</TableCell>
                            <TableCell className="text-xs">
                              <span className="font-semibold text-zinc-805 dark:text-zinc-100">{usedCount}</span>
                              <span className="text-zinc-400 dark:text-zinc-500"> / {lic.maxActivations} slots used</span>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                lic.status === "ACTIVE" 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                              )}>
                                {lic.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                {lic.status === "ACTIVE" ? (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30"
                                    onClick={() => handleDesktopRevoke(lic.id)}
                                    disabled={actionLoading !== null}
                                  >
                                    Revoke
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-900/30"
                                    onClick={() => handleDesktopReactivate(lic.id)}
                                    disabled={actionLoading !== null}
                                  >
                                    Reactivate
                                  </Button>
                                )}
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleDesktopReset(lic.id)}
                                  disabled={actionLoading !== null || usedCount === 0}
                                >
                                  Clear Slots
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/20">
                              <TableCell colSpan={7} className="p-4">
                                <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
                                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">💻 Activated Hardware Details ({usedCount})</h3>
                                  {usedCount === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">No computers have activated this license yet.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-[10px]">Machine ID</TableHead>
                                            <TableHead className="text-[10px]">Computer Name</TableHead>
                                            <TableHead className="text-[10px]">OS Version</TableHead>
                                            <TableHead className="text-[10px]">IP Address</TableHead>
                                            <TableHead className="text-[10px]">Activated Date</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {lic.activations?.map((act) => (
                                            <TableRow key={act.id}>
                                              <TableCell className="font-mono text-[11px]">{act.machineId.substring(0, 16)}...</TableCell>
                                              <TableCell className="font-medium text-xs">{act.machineName || "Desktop App Client"}</TableCell>
                                              <TableCell className="text-xs">{act.osName || "Unknown OS"}</TableCell>
                                              <TableCell className="font-mono text-[11px]">{act.ipAddress}</TableCell>
                                              <TableCell className="text-xs">{formatDate(act.activatedAt)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )
            ) : (
              /* WEB / SAAS LICENSES TABLE */
              filteredWebLicenses.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 dark:text-zinc-400">No web licenses found matching your filters.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: "40px" }}></TableHead>
                      <TableHead>Activation Key</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>Product / Brand</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Device Slots</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right" style={{ width: "240px" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWebLicenses.map((lic) => {
                      const isExpanded = expandedRow?.type === "web" && expandedRow?.id === lic.id;
                      const usedCount = lic.activations?.length || 0;

                      return (
                        <Fragment key={lic.id}>
                          <TableRow className={cn(isExpanded && "bg-zinc-50/30 dark:bg-zinc-900/10")}>
                            <TableCell>
                              <button 
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold border-0 bg-transparent cursor-pointer select-none text-[10px]" 
                                onClick={() => toggleRow("web", lic.id)}
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-100">{lic.activationKey}</code>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block">{lic.customerEmail || "No Email"}</span>
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">ID: <code className="font-mono">{lic.orderId}</code></div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{getProductName(lic.productId)}</span>
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{lic.pricingTierName} Tier</div>
                            </TableCell>
                            <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{formatDate(lic.expiresAt)}</TableCell>
                            <TableCell className="text-xs">
                              <span className="font-semibold text-zinc-805 dark:text-zinc-100">{usedCount}</span>
                              <span className="text-zinc-400 dark:text-zinc-500"> / {lic.maxDevices} devices</span>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                lic.status === "ACTIVE" 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                              )}>
                                {lic.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                {lic.status === "ACTIVE" ? (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30"
                                    onClick={() => handleWebRevoke(lic.id)}
                                    disabled={actionLoading !== null}
                                  >
                                    Revoke
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-900/30"
                                    onClick={() => handleWebReactivate(lic.id)}
                                    disabled={actionLoading !== null}
                                  >
                                    Reactivate
                                  </Button>
                                )}
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleWebReset(lic.id)}
                                  disabled={actionLoading !== null || usedCount === 0}
                                >
                                  Clear Slots
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/20">
                              <TableCell colSpan={8} className="p-4">
                                <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
                                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">📱 Registered Hardware Slots ({usedCount})</h3>
                                  {usedCount === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">No hardware fingerprint bindings registered.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-[10px]">Hardware Fingerprint</TableHead>
                                            <TableHead className="text-[10px]">Device Nickname</TableHead>
                                            <TableHead className="text-[10px]">Activated Date</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {lic.activations?.map((act) => (
                                            <TableRow key={act.id}>
                                              <TableCell className="font-mono text-[11px]">{act.hardwareFingerprint}</TableCell>
                                              <TableCell className="font-medium text-xs">{act.deviceName}</TableCell>
                                              <TableCell className="text-xs">{formatDate(act.activatedAt)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )
            )}
          </div>
        </Card>
      )}

      {/* GENERATE KEY MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowGenerateModal(false)}>
          <Card className="w-full max-w-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
              <div className="space-y-1">
                <CardTitle>Issue License Key</CardTitle>
                <CardDescription>Configure validation rules for the new license key.</CardDescription>
              </div>
              <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold border-0 bg-transparent cursor-pointer" onClick={() => setShowGenerateModal(false)}>✕</button>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {/* Modal Subtabs */}
              <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit select-none">
                <button 
                  type="button"
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 bg-transparent",
                    activeTab === "desktop"
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                  onClick={() => setActiveTab("desktop")}
                >
                  Desktop App
                </button>
                <button 
                  type="button"
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 bg-transparent",
                    activeTab === "web"
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                  onClick={() => setActiveTab("web")}
                >
                  Web Storefront
                </button>
              </div>

              {activeTab === "desktop" ? (
                /* DESKTOP GENERATE FORM */
                <form onSubmit={handleGenerateDesktopLicense} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Brand Prefix</label>
                      <Input 
                        type="text"
                        value={desktopForm.brandPrefix}
                        disabled={true}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">License Type</label>
                      <Select 
                        value={desktopForm.licenseType}
                        onChange={(e) => setDesktopForm({ ...desktopForm, licenseType: e.target.value })}
                      >
                        <option value="STANDARD">Standard</option>
                        <option value="BUSINESS">Business</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Max Machine Activations</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="1000"
                        value={desktopForm.maxActivations}
                        onChange={(e) => setDesktopForm({ ...desktopForm, maxActivations: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Duration (Months)</label>
                      <Select 
                        value={desktopForm.durationMonths}
                        onChange={(e) => setDesktopForm({ ...desktopForm, durationMonths: parseInt(e.target.value) || 0 })}
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months (1 Year)</option>
                        <option value="24">24 Months (2 Years)</option>
                        <option value="0">0 (Lifetime Key)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={actionLoading !== null} className="shadow-sm">
                      {actionLoading === "generate-desktop" ? "Generating..." : "Generate Desktop Key"}
                    </Button>
                  </div>
                </form>
              ) : (
                /* WEB GENERATE FORM */
                <form onSubmit={handleGenerateWebLicense} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Select Product Package</label>
                      <Select 
                        value={webForm.productId}
                        onChange={(e) => setWebForm({ ...webForm, productId: e.target.value })}
                        required
                      >
                        {products.length === 0 ? (
                          <option value="">No products found in DB</option>
                        ) : (
                          products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Slug: {p.slug})</option>
                          ))
                        )}
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pricing Tier Name</label>
                      <Select 
                        value={webForm.pricingTierName}
                        onChange={(e) => setWebForm({ ...webForm, pricingTierName: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Personal">Personal</option>
                        <option value="Business">Business</option>
                        <option value="Enterprise">Enterprise</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Max Allowed Devices</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="1000"
                        value={webForm.maxDevices}
                        onChange={(e) => setWebForm({ ...webForm, maxDevices: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Customer Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="client@example.com"
                        value={webForm.customerEmail}
                        onChange={(e) => setWebForm({ ...webForm, customerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Order Identifier (Order ID)</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. ORD-765421"
                        value={webForm.orderId}
                        onChange={(e) => setWebForm({ ...webForm, orderId: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Duration Validity (Months)</label>
                      <Select 
                        value={webForm.durationMonths}
                        onChange={(e) => setWebForm({ ...webForm, durationMonths: parseInt(e.target.value) || 0 })}
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months (1 Year)</option>
                        <option value="0">0 (Lifetime License)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={actionLoading !== null} className="shadow-sm">
                      {actionLoading === "generate-web" ? "Generating..." : "Generate Web Key"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
