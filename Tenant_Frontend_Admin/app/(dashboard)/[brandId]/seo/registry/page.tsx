"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  AdminRegistryAPI, 
  AdminCategoryAPI 
} from "@/services/api";
import { AuthService } from "@/services/auth";
import { SourceFormat, TargetFormat, SupportedClient, KeyFeature } from "@/types/registry";
import { Category } from "@/services/api";

// central UI primitives
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

type RegistryTab = "categories" | "source-formats" | "target-formats" | "supported-clients" | "key-features";

export default function GlobalRegistryPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = (params?.brandId as string) || "brandA";

  const [userRole, setUserRole] = useState<string>("");

  // active registry subtab state
  const [activeRegistryTab, setActiveRegistryTab] = useState<RegistryTab>("categories");

  // registry entities lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceFormats, setSourceFormats] = useState<SourceFormat[]>([]);
  const [targetFormats, setTargetFormats] = useState<TargetFormat[]>([]);
  const [supportedClients, setSupportedClients] = useState<SupportedClient[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([]);

  // operation loaders and alerts
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registryActionLoading, setRegistryActionLoading] = useState(false);
  const [registryToast, setRegistryToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [registryModalMode, setRegistryModalMode] = useState<"add" | "edit" | "delete">("add");
  const [selectedRegistryItem, setSelectedRegistryItem] = useState<any | null>(null);

  // form fields state
  const [registryFormKey, setRegistryFormKey] = useState("");
  const [registryFormName, setRegistryFormName] = useState("");
  const [registryFormDescription, setRegistryFormDescription] = useState("");
  const [registryFormIcon, setRegistryFormIcon] = useState("");
  const [registryFormColor, setRegistryFormColor] = useState("blue");
  const [registryFormSupportsMultipleAccounts, setRegistryFormSupportsMultipleAccounts] = useState(false);

  // ─── STRICT ACCESS GUARD ───
  useEffect(() => {
    const session = AuthService.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    const role = session.role;
    setUserRole(role);
    if (role !== "SEO" && role !== "SEO_CW_PRODUCT_MANAGER" && role !== "SUPER_ADMIN" && role !== "OWNER") {
      router.push(`/${brandId}`);
    }
  }, [brandId, router]);

  // load registry data on subtab change
  useEffect(() => {
    if (userRole === "SEO" || userRole === "SEO_CW_PRODUCT_MANAGER" || userRole === "SUPER_ADMIN" || userRole === "OWNER") {
      loadRegistryData();
    }
  }, [activeRegistryTab, brandId, userRole]);

  const triggerRegistryToast = (msg: string, type: "success" | "error" = "success") => {
    setRegistryToast({ msg, type });
    setTimeout(() => setRegistryToast(null), 3000);
  };

  const loadRegistryData = async () => {
    setRegistryLoading(true);
    try {
      if (activeRegistryTab === "categories") {
        const data = await AdminCategoryAPI.getAll();
        setCategories(data);
      } else if (activeRegistryTab === "source-formats") {
        const data = await AdminRegistryAPI.getSourceFormats();
        setSourceFormats(data);
      } else if (activeRegistryTab === "target-formats") {
        const data = await AdminRegistryAPI.getTargetFormats();
        setTargetFormats(data);
      } else if (activeRegistryTab === "supported-clients") {
        const data = await AdminRegistryAPI.getSupportedClients();
        setSupportedClients(data);
      } else if (activeRegistryTab === "key-features") {
        const data = await AdminRegistryAPI.getKeyFeatures();
        setKeyFeatures(data);
      }
    } catch (err: any) {
      console.error(err);
      triggerRegistryToast("Failed to load registry data", "error");
    } finally {
      setRegistryLoading(false);
    }
  };

  const openRegistryAddModal = () => {
    setRegistryModalMode("add");
    setSelectedRegistryItem(null);
    setRegistryFormKey("");
    setRegistryFormName("");
    setRegistryFormDescription("");
    setRegistryFormIcon("");
    setRegistryFormColor("blue");
    setRegistryFormSupportsMultipleAccounts(false);
    setIsRegistryModalOpen(true);
  };

  const openRegistryEditModal = (item: any) => {
    setRegistryModalMode("edit");
    setSelectedRegistryItem(item);
    setRegistryFormKey(item.key || item.id || "");
    setRegistryFormName(item.name || item.label || "");
    setRegistryFormDescription(item.description || "");
    setRegistryFormIcon(item.icon || "");
    setRegistryFormColor(item.color || "blue");
    setRegistryFormSupportsMultipleAccounts(!!item.supportsMultipleAccounts);
    setIsRegistryModalOpen(true);
  };

  const openRegistryDeleteModal = (item: any) => {
    setRegistryModalMode("delete");
    setSelectedRegistryItem(item);
    setIsRegistryModalOpen(true);
  };

  const handleRegistrySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRegistryActionLoading(true);

    try {
      if (registryModalMode === "delete") {
        if (activeRegistryTab === "categories") {
          await AdminCategoryAPI.delete(selectedRegistryItem.id);
          triggerRegistryToast("Category deleted successfully");
        } else if (activeRegistryTab === "source-formats") {
          await AdminRegistryAPI.deleteSourceFormat(selectedRegistryItem.id);
          triggerRegistryToast("Source Format deleted successfully");
        } else if (activeRegistryTab === "target-formats") {
          await AdminRegistryAPI.deleteTargetFormat(selectedRegistryItem.id);
          triggerRegistryToast("Target Format deleted successfully");
        } else if (activeRegistryTab === "supported-clients") {
          await AdminRegistryAPI.deleteSupportedClient(selectedRegistryItem.id);
          triggerRegistryToast("Supported Client deleted successfully");
        } else if (activeRegistryTab === "key-features") {
          await AdminRegistryAPI.deleteKeyFeature(selectedRegistryItem.id);
          triggerRegistryToast("Key Feature deleted successfully");
        }
      } else {
        const keyVal = registryFormKey.trim().toLowerCase().replace(/\s+/g, "-");
        if (!keyVal || !registryFormName.trim()) {
          triggerRegistryToast("Key and Name are required", "error");
          setRegistryActionLoading(false);
          return;
        }

        if (activeRegistryTab === "categories") {
          const payload: Partial<Category> = {
            id: registryModalMode === "add" ? keyVal : selectedRegistryItem.id,
            label: registryFormName.trim(),
            description: registryFormDescription.trim(),
            icon: registryFormIcon.trim() || "tag",
            color: registryFormColor,
            count: selectedRegistryItem?.count || 0,
            siteId: brandId,
          };

          if (registryModalMode === "add") {
            await AdminCategoryAPI.create(payload);
            triggerRegistryToast("Category created successfully");
          } else {
            await AdminCategoryAPI.update(selectedRegistryItem.id, payload);
            triggerRegistryToast("Category updated successfully");
          }
        } else if (activeRegistryTab === "source-formats") {
          const payload: Partial<SourceFormat> = {
            key: keyVal,
            name: registryFormName.trim(),
            description: registryFormDescription.trim(),
            icon: registryFormIcon.trim(),
            siteId: brandId,
            supportsMultipleAccounts: registryFormSupportsMultipleAccounts,
          };

          if (registryModalMode === "add") {
            await AdminRegistryAPI.createSourceFormat(payload);
            triggerRegistryToast("Source Format created successfully");
          } else {
            await AdminRegistryAPI.updateSourceFormat(selectedRegistryItem.id, payload);
            triggerRegistryToast("Source Format updated successfully");
          }
        } else if (activeRegistryTab === "target-formats") {
          const payload: Partial<TargetFormat> = {
            key: keyVal,
            name: registryFormName.trim(),
            description: registryFormDescription.trim(),
            icon: registryFormIcon.trim(),
            siteId: brandId,
            supportsMultipleAccounts: registryFormSupportsMultipleAccounts,
          };

          if (registryModalMode === "add") {
            await AdminRegistryAPI.createTargetFormat(payload);
            triggerRegistryToast("Target Format created successfully");
          } else {
            await AdminRegistryAPI.updateTargetFormat(selectedRegistryItem.id, payload);
            triggerRegistryToast("Target Format updated successfully");
          }
        } else if (activeRegistryTab === "supported-clients") {
          const payload: Partial<SupportedClient> = {
            key: keyVal,
            name: registryFormName.trim(),
            description: registryFormDescription.trim(),
            icon: registryFormIcon.trim(),
            siteId: brandId,
          };

          if (registryModalMode === "add") {
            await AdminRegistryAPI.createSupportedClient(payload);
            triggerRegistryToast("Supported Client created successfully");
          } else {
            await AdminRegistryAPI.updateSupportedClient(selectedRegistryItem.id, payload);
            triggerRegistryToast("Supported Client updated successfully");
          }
        } else if (activeRegistryTab === "key-features") {
          const payload: Partial<KeyFeature> = {
            key: keyVal,
            name: registryFormName.trim(),
            description: registryFormDescription.trim(),
            siteId: brandId,
          };

          if (registryModalMode === "add") {
            await AdminRegistryAPI.createKeyFeature(payload);
            triggerRegistryToast("Key Feature created successfully");
          } else {
            await AdminRegistryAPI.updateKeyFeature(selectedRegistryItem.id, payload);
            triggerRegistryToast("Key Feature updated successfully");
          }
        }
      }

      setIsRegistryModalOpen(false);
      loadRegistryData();
    } catch {
      triggerRegistryToast("Operation failed. Try again.", "error");
    } finally {
      setRegistryActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-6 md:p-8">
      {/* Toast Alert Popups */}
      {registryToast && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-55 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold animate-slide-in border",
            registryToast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          {registryToast.msg}
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            🗄️ Global Data Registry
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 max-w-xl">
            Configure system formats, categories, compatibility lists, and key tags globally across the {brandId} storefront.
          </p>
        </div>
        
        <Button 
          onClick={openRegistryAddModal}
          className="h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          + Add Item
        </Button>
      </div>

      {/* Tab Selectors Row */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {[
          { id: "categories", label: "Categories" },
          { id: "source-formats", label: "Source Formats" },
          { id: "target-formats", label: "Target Formats" },
          { id: "supported-clients", label: "Supported Clients" },
          { id: "key-features", label: "Key Features" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveRegistryTab(t.id as RegistryTab)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md border-0 transition-all cursor-pointer",
              activeRegistryTab === t.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm"
                : "bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Clean high-contrast card content list */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {registryLoading ? (
            <div className="flex items-center justify-center p-12 text-sm text-zinc-400 dark:text-zinc-500 animate-pulse font-medium">
              Loading registry database...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent bg-zinc-55 dark:bg-zinc-900/40">
                    <TableHead className="w-[20%] text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Key / ID</TableHead>
                    <TableHead className="w-[20%] text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Name</TableHead>
                    <TableHead className="w-[30%] text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Description</TableHead>
                    {(activeRegistryTab === "source-formats" || activeRegistryTab === "target-formats") && (
                      <TableHead className="w-[15%] text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Multi-Account</TableHead>
                    )}
                    {activeRegistryTab !== "key-features" && (
                      <TableHead className="w-[15%] text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Visuals</TableHead>
                    )}
                    <TableHead className="text-right text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wider py-4 px-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty States */}
                  {activeRegistryTab === "categories" && categories.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center p-10 text-zinc-400 text-xs">No categories seeded. Add one to start.</TableCell></TableRow>
                  )}
                  {activeRegistryTab === "source-formats" && sourceFormats.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center p-10 text-zinc-400 text-xs">No source formats registered. Add one to start.</TableCell></TableRow>
                  )}
                  {activeRegistryTab === "target-formats" && targetFormats.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center p-10 text-zinc-400 text-xs">No target formats registered. Add one to start.</TableCell></TableRow>
                  )}
                  {activeRegistryTab === "supported-clients" && supportedClients.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center p-10 text-zinc-400 text-xs">No supported clients registered. Add one to start.</TableCell></TableRow>
                  )}
                  {activeRegistryTab === "key-features" && keyFeatures.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center p-10 text-zinc-400 text-xs">No key features defined. Add one to start.</TableCell></TableRow>
                  )}

                  {/* Categories Row */}
                  {activeRegistryTab === "categories" &&
                    categories.map((c) => (
                      <TableRow key={c.id} className="border-b border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                        <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-5 py-3.5">{c.id}</TableCell>
                        <TableCell className="font-semibold text-zinc-950 dark:text-zinc-100 px-5 py-3.5">{c.label}</TableCell>
                        <TableCell className="text-zinc-505 dark:text-zinc-400 max-w-sm truncate text-xs px-5 py-3.5">{c.description}</TableCell>
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {c.icon && <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-805">{c.icon}</Badge>}
                            {c.color && (
                              <Badge className="capitalize text-[10px]" style={{ backgroundColor: c.color === "blue" ? "#3b82f6" : c.color === "green" ? "#22c55e" : c.color === "purple" ? "#a855f7" : c.color === "orange" ? "#f97316" : c.color === "red" ? "#ef4444" : "#64748b" }}>
                                {c.color}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-1 px-5 py-3.5 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openRegistryEditModal(c)} className="text-zinc-600 dark:text-zinc-305 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs px-2.5 h-8">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openRegistryDeleteModal(c)} className="text-red-500 hover:bg-red-505/10 text-xs px-2.5 h-8">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Source Formats Row */}
                  {activeRegistryTab === "source-formats" &&
                    sourceFormats.map((sf) => (
                      <TableRow key={sf.id} className="border-b border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                        <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-5 py-3.5">{sf.key}</TableCell>
                        <TableCell className="font-semibold text-zinc-955 dark:text-zinc-100 px-5 py-3.5">{sf.name}</TableCell>
                        <TableCell className="text-zinc-505 dark:text-zinc-400 max-w-sm truncate text-xs px-5 py-3.5">{sf.description}</TableCell>
                        <TableCell className="px-5 py-3.5">
                          {sf.supportsMultipleAccounts ? (
                            <Badge className="bg-emerald-505/10 border-emerald-505/20 text-emerald-600 dark:text-emerald-400 border font-semibold text-[10px]">
                              Supports
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-400 border-zinc-200 dark:border-zinc-805 text-[10px]">
                              Single Only
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3.5">
                          {sf.icon && <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-805 font-mono text-[10px]">{sf.icon}</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1 px-5 py-3.5 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openRegistryEditModal(sf)} className="text-zinc-600 dark:text-zinc-305 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs px-2.5 h-8">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openRegistryDeleteModal(sf)} className="text-red-500 hover:bg-red-505/10 text-xs px-2.5 h-8">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Target Formats Row */}
                  {activeRegistryTab === "target-formats" &&
                    targetFormats.map((tf) => (
                      <TableRow key={tf.id} className="border-b border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                        <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-5 py-3.5">{tf.key}</TableCell>
                        <TableCell className="font-semibold text-zinc-955 dark:text-zinc-100 px-5 py-3.5">{tf.name}</TableCell>
                        <TableCell className="text-zinc-505 dark:text-zinc-400 max-w-sm truncate text-xs px-5 py-3.5">{tf.description}</TableCell>
                        <TableCell className="px-5 py-3.5">
                          {tf.supportsMultipleAccounts ? (
                            <Badge className="bg-emerald-505/10 border-emerald-505/20 text-emerald-600 dark:text-emerald-400 border font-semibold text-[10px]">
                              Supports
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-400 border-zinc-200 dark:border-zinc-805 text-[10px]">
                              Single Only
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3.5">
                          {tf.icon && <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-805 font-mono text-[10px]">{tf.icon}</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1 px-5 py-3.5 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openRegistryEditModal(tf)} className="text-zinc-600 dark:text-zinc-305 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs px-2.5 h-8">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openRegistryDeleteModal(tf)} className="text-red-500 hover:bg-red-505/10 text-xs px-2.5 h-8">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Supported Clients Row */}
                  {activeRegistryTab === "supported-clients" &&
                    supportedClients.map((sc) => (
                      <TableRow key={sc.id} className="border-b border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                        <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-5 py-3.5">{sc.key}</TableCell>
                        <TableCell className="font-semibold text-zinc-955 dark:text-zinc-100 px-5 py-3.5">{sc.name}</TableCell>
                        <TableCell className="text-zinc-505 dark:text-zinc-400 max-w-sm truncate text-xs px-5 py-3.5">{sc.description}</TableCell>
                        <TableCell className="px-5 py-3.5">
                          {sc.icon && <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-805 font-mono text-[10px]">{sc.icon}</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-1 px-5 py-3.5 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openRegistryEditModal(sc)} className="text-zinc-600 dark:text-zinc-305 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs px-2.5 h-8">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openRegistryDeleteModal(sc)} className="text-red-500 hover:bg-red-505/10 text-xs px-2.5 h-8">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Key Features Row */}
                  {activeRegistryTab === "key-features" &&
                    keyFeatures.map((kf) => (
                      <TableRow key={kf.id} className="border-b border-zinc-200 dark:border-zinc-855 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                        <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-5 py-3.5">{kf.key}</TableCell>
                        <TableCell className="font-semibold text-zinc-955 dark:text-zinc-100 px-5 py-3.5">{kf.name}</TableCell>
                        <TableCell className="text-zinc-505 dark:text-zinc-400 max-w-sm truncate text-xs px-5 py-3.5">{kf.description}</TableCell>
                        <TableCell className="text-right space-x-1 px-5 py-3.5 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openRegistryEditModal(kf)} className="text-zinc-600 dark:text-zinc-305 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs px-2.5 h-8">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openRegistryDeleteModal(kf)} className="text-red-500 hover:bg-red-505/10 text-xs px-2.5 h-8">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRUD Modal Dialogue */}
      {isRegistryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <CardHeader className="border-b border-zinc-200 dark:border-zinc-855">
              <CardTitle className="text-zinc-900 dark:text-white text-sm font-bold">
                {registryModalMode === "delete" && "Confirm Deletion"}
                {registryModalMode === "add" && `Add New ${activeRegistryTab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`}
                {registryModalMode === "edit" && `Edit ${activeRegistryTab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleRegistrySubmit}>
              <CardContent className="p-6 space-y-4">
                {registryModalMode === "delete" ? (
                  <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed">
                    Are you sure you want to delete <strong>{selectedRegistryItem?.name || selectedRegistryItem?.label || selectedRegistryItem?.key}</strong>? This action is permanent and might affect catalog mapping associations.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Key / Slug (Unique)</label>
                      <Input
                        value={registryFormKey}
                        onChange={(e) => setRegistryFormKey(e.target.value)}
                        placeholder="e.g. email-migration, mbox, outlook"
                        disabled={registryModalMode === "edit"}
                        className="bg-transparent dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs focus-visible:ring-indigo-500/20"
                        required
                      />
                      {registryModalMode === "add" && (
                        <p className="text-[10px] text-zinc-400 font-mono">Will be normalized to lowercase with dashes.</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Display Name</label>
                      <Input
                        value={registryFormName}
                        onChange={(e) => setRegistryFormName(e.target.value)}
                        placeholder="e.g. Email Migration, MBOX Archive"
                        className="bg-transparent dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs focus-visible:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</label>
                      <textarea
                        value={registryFormDescription}
                        onChange={(e) => setRegistryFormDescription(e.target.value)}
                        placeholder="Provide details about this registry item..."
                        rows={3}
                        className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-white shadow-sm transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 outline-none"
                      />
                    </div>

                    {activeRegistryTab !== "key-features" && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Icon Key</label>
                        <Input
                          value={registryFormIcon}
                          onChange={(e) => setRegistryFormIcon(e.target.value)}
                          placeholder="e.g. mail, shield, hard-drive, file"
                          className="bg-transparent dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs focus-visible:ring-indigo-500/20"
                        />
                      </div>
                    )}

                    {activeRegistryTab === "categories" && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Theme Color</label>
                        <Select
                          value={registryFormColor}
                          onChange={(e) => setRegistryFormColor(e.target.value)}
                          className="bg-transparent dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus-visible:ring-indigo-500/20"
                        >
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="purple">Purple</option>
                          <option value="orange">Orange</option>
                          <option value="cyan">Cyan</option>
                          <option value="red">Red</option>
                        </Select>
                      </div>
                    )}

                    {(activeRegistryTab === "source-formats" || activeRegistryTab === "target-formats") && (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-1">
                        <div className="space-y-0.5">
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Supports Multiple Accounts
                          </label>
                          <span className="block text-[10px] text-zinc-400 dark:text-zinc-400 leading-tight">
                            Allows batch/impersonation mode (e.g. GSuite, Office 365, IMAP).
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={registryFormSupportsMultipleAccounts}
                          onChange={(e) => setRegistryFormSupportsMultipleAccounts(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 p-6 pt-0 border-t border-zinc-200 dark:border-zinc-855 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegistryModalOpen(false)}
                  className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs px-3 h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registryActionLoading}
                  className={cn(
                    "text-xs px-4 h-9 font-semibold",
                    registryModalMode === "delete" 
                      ? "bg-red-600 hover:bg-red-500 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  )}
                >
                  {registryActionLoading ? "Saving..." : registryModalMode === "delete" ? "Delete" : "Save"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
