"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function DeploymentPage() {
  const params = useParams();
  const brandId = params?.brandId as string || "brandA";

  const [logs, setLogs] = useState<string[]>([
    "[02:08:10] Initializing deployment pipeline for " + brandId.toUpperCase() + "...",
    "[02:08:12] Checking Git repository status...",
    "[02:08:14] Fetching latest commits from main branch...",
    "[02:08:15] Dependency check: All packages verified.",
    "[02:08:18] Starting build process: npm run build...",
    "[02:08:21] Astro compilation complete (build time: 2.02 seconds).",
    "[02:08:23] Compiling Tailwind CSS v4 assets...",
    "[02:08:25] Assets successfully synced to edge servers.",
    "[02:08:26] Health checks: Passed 5/5 storefront ports.",
    "[02:08:27] Deployment complete. Status: ACTIVE."
  ]);
  
  const [deploying, setDeploying] = useState(false);

  function triggerDeploy() {
    setDeploying(true);
    const newTimestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    
    setLogs(prev => [
      ...prev,
      `[${newTimestamp}] Triggering manual rolling redeploy...`,
      `[${newTimestamp}] Syncing environment parameters...`
    ]);

    setTimeout(() => {
      const finishTimestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
      setLogs(prev => [
        ...prev,
        `[${finishTimestamp}] Re-building static paths for legal & products...`,
        `[${finishTimestamp}] Rolling update succeeded. Zero downtime achieved.`
      ]);
      setDeploying(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Deployment Manager</h2>
          <p className="text-xs text-muted-foreground">Monitor and trigger production builds for storefront: {brandId.toUpperCase()}</p>
        </div>
        <Button
          onClick={triggerDeploy}
          disabled={deploying}
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 shadow-md transition-all active:scale-95 duration-200"
        >
          {deploying ? "Building..." : "Trigger Deployment"}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Storefront Status</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between mt-1">
              Active
              <Badge variant="success">HEALTHY</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Domain pointing: prismmigration.local (Port 3001)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Release Version</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between mt-1">
              v1.2.5
              <Badge variant="secondary">STABLE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last deployment: 2 hours ago via CLI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Server Metrics</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between mt-1">
              99.98%
              <Badge variant="default" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">UPTIME</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                <span>CPU UTILIZATION</span>
                <span>12.4%</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "12.4%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terminal logs */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4 bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="ml-2 font-mono text-xs text-muted-foreground">build_logs.sh</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-zinc-900 font-mono text-xs text-zinc-300 leading-relaxed max-h-[350px] overflow-y-auto space-y-1.5 scrollbar-thin rounded-b-xl border-t border-zinc-800">
          {logs.map((log, idx) => {
            let color = "text-zinc-300";
            if (log.includes("complete") || log.includes("succeeded") || log.includes("HEALTHY") || log.includes("ACTIVE")) color = "text-emerald-400";
            if (log.includes("Triggering") || log.includes("manual")) color = "text-amber-400";
            return (
              <div key={idx} className={color}>
                {log}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
