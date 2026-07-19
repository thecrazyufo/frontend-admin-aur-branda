"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";

export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      const isSuperAdmin = session.role === "SUPER_ADMIN" || session.role === "OWNER";
      if (isSuperAdmin) {
        router.replace("/owner");
      } else {
        router.replace(`/${session.brandId}`);
      }
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs font-semibold text-zinc-500 font-sans">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <span>Redirecting to secure workspace...</span>
      </div>
    </div>
  );
}
