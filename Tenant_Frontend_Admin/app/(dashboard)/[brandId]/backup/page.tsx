"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminBackupAPI, BackupFile } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Search,
  Lock
} from "lucide-react";

export default function DatabaseBackupsPage() {
  const params = useParams();
  const brandId = (params?.brandId as string) || "";

  const [userRole, setUserRole] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user role from local storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("admin_role"));
    }
  }, []);

  const isAuthorized = userRole === "SUPER_ADMIN" || userRole === "OWNER";

  // Fetch backups list
  const loadBackups = async () => {
    if (!isAuthorized) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const list = await AdminBackupAPI.getAll();
      setBackups(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to retrieve backup files from the server. Ensure the backend backups mount is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== null) {
      loadBackups();
    }
  }, [userRole]);

  // Handle manual backup trigger
  const handleForceBackup = async () => {
    try {
      setActionLoading("trigger");
      setErrorMsg(null);
      setSuccessMsg(null);
      const result = await AdminBackupAPI.trigger();
      if (result.status === "success") {
        setSuccessMsg(result.message || "Database backup file generated successfully.");
        await loadBackups();
      } else {
        setErrorMsg(result.message || "An error occurred while generating the database backup.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Backup execution failed. Verify that pg_dump is installed in the backend runtime.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle backup download
  const handleDownload = async (fileName: string) => {
    try {
      setActionLoading(`download-${fileName}`);
      await AdminBackupAPI.download(fileName);
      setSuccessMsg(`Downloading ${fileName}...`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to download ${fileName}.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle backup deletion
  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the backup file "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(`delete-${fileName}`);
      setErrorMsg(null);
      setSuccessMsg(null);
      await AdminBackupAPI.delete(fileName);
      setSuccessMsg("Backup file deleted successfully.");
      await loadBackups();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to delete backup file "${fileName}".`);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filtered backups list
  const filteredBackups = backups.filter(b => 
    b.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If role is loaded and user is not SUPER_ADMIN / OWNER, render access restriction screen
  if (userRole !== null && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500/80 mb-4 shadow-lg">
          <Lock size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restrained</h2>
        <p className="text-zinc-400 max-w-md text-xs leading-relaxed">
          Database backup management contains sensitive system-wide multi-tenant configuration parameters, password hashes, and license files.
          Access is exclusively restricted to the <strong>SUPER_ADMIN</strong> and <strong>OWNER</strong> profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="text-emerald-500" size={24} />
            Database Backup Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generate, list, download, and manage system database snapshots.
          </p>
        </div>

        <Button
          variant="default"
          onClick={handleForceBackup}
          disabled={actionLoading !== null}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 shadow-md"
        >
          {actionLoading === "trigger" ? (
            <RefreshCw className="animate-spin" size={15} />
          ) : (
            <RefreshCw size={15} />
          )}
          Force Database Backup
        </Button>
      </div>

      {/* Security Alert Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-amber-200/90 shadow-sm">
        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
        <div>
          <span className="font-bold text-amber-400 block mb-0.5">Sensitive Data Guard Warning:</span>
          Backups are compressed Postgres Gzipped SQL packages containing active license keys, customer transactional records, system credential hashes, and tenant configurations. Ensure downloaded files are kept strictly confidential and stored on encrypted offline storage.
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-300">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Backups Management Table Card */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-white text-base">Historical Snapshots</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Backups generated dynamically or by cron scheduled jobs.
              </CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <Input
                type="text"
                placeholder="Search backup filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white placeholder-zinc-500 focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
              <RefreshCw className="animate-spin text-emerald-500" size={24} />
              <span className="text-xs">Scanning backup storage...</span>
            </div>
          ) : filteredBackups.length > 0 ? (
            <Table>
              <TableHeader className="bg-zinc-900/40 border-b border-zinc-800">
                <TableRow>
                  <TableHead className="text-zinc-400 text-xs py-3">Filename</TableHead>
                  <TableHead className="text-zinc-400 text-xs">Date Created</TableHead>
                  <TableHead className="text-zinc-400 text-xs">File Size</TableHead>
                  <TableHead className="text-zinc-400 text-xs text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackups.map((file) => (
                  <TableRow key={file.fileName} className="hover:bg-zinc-900/20 border-b border-zinc-900">
                    <TableCell className="font-mono text-zinc-200 text-xs py-4 flex items-center gap-2">
                      <FileText className="text-zinc-500 shrink-0" size={15} />
                      {file.fileName}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{file.formattedDate}</TableCell>
                    <TableCell className="text-zinc-300 text-xs">{formatBytes(file.sizeBytes)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(file.fileName)}
                          disabled={actionLoading !== null}
                          className="h-8 px-2.5 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] font-semibold"
                        >
                          {actionLoading === `download-${file.fileName}` ? (
                            <RefreshCw className="animate-spin mr-1" size={12} />
                          ) : (
                            <Download className="mr-1" size={12} />
                          )}
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(file.fileName)}
                          disabled={actionLoading !== null}
                          className="h-8 px-2.5 hover:bg-red-600/90 text-[11px] font-semibold"
                        >
                          {actionLoading === `delete-${file.fileName}` ? (
                            <RefreshCw className="animate-spin mr-1" size={12} />
                          ) : (
                            <Trash2 className="mr-1" size={12} />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20 text-zinc-400 text-xs leading-relaxed">
              <Database size={32} className="mx-auto mb-2 text-zinc-600" />
              No backup snapshot files found.<br />
              Click <strong>"Force Database Backup"</strong> above to generate one manually.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
