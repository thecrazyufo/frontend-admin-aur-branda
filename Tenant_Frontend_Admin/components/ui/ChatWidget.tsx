"use client";

import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    // Define global Tawk API
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    // Hide default widget on load and minimize
    (window as any).Tawk_API.onLoad = function () {
      console.log("Admin Tawk.to script loaded successfully.");
      if (typeof (window as any).Tawk_API.hideWidget === "function") {
        (window as any).Tawk_API.hideWidget();
      }
    };
    (window as any).Tawk_API.onChatMinimized = function () {
      if (typeof (window as any).Tawk_API.hideWidget === "function") {
        (window as any).Tawk_API.hideWidget();
      }
    };
    (window as any).Tawk_API.onMinimize = function () {
      if (typeof (window as any).Tawk_API.hideWidget === "function") {
        (window as any).Tawk_API.hideWidget();
      }
    };

    // Global trigger function for Admin panel consistency
    (window as any).triggerTawkOpen = () => {
      console.log("Admin triggerTawkOpen called. Launching support chat...");
      let attempts = 0;
      const tryOpen = () => {
        const api = (window as any).Tawk_API;
        if (api && typeof api.maximize === "function") {
          console.log("Admin Tawk_API is fully initialized. Maximizing window.");
          if (typeof api.showWidget === "function") {
            api.showWidget();
          }
          api.maximize();
        } else if (attempts < 30) {
          attempts++;
          console.warn("Admin Tawk_API not ready yet. Retrying in 100ms... Attempt " + attempts + "/30");
          setTimeout(tryOpen, 100);
        } else {
          console.error("Admin Tawk_API failed to initialize.");
        }
      };
      tryOpen();
    };

    // Load script
    console.log("Injecting Admin Tawk.to script...");
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = "https://embed.tawk.to/6a39aeb5351d6e1d43433240/1jrol4u8n";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s0?.parentNode?.insertBefore(s1, s0);

    return () => {
      s1.remove();
    };
  }, []);

  const handleToggle = () => {
    if (typeof (window as any).triggerTawkOpen === "function") {
      (window as any).triggerTawkOpen();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="hover:scale-115 active:scale-95 group transition-all duration-300"
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        zIndex: 999999,
        display: "flex",
        width: "56px",
        height: "56px",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        backgroundColor: "#10B981",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        outline: "none",
        visibility: "visible",
        opacity: 1
      }}
      aria-label="Open support chat"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:scale-110"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>

      {/* Active Online Status Indicator (White/Green) */}
      <span className="absolute top-1 right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white dark:border-zinc-950"></span>
      </span>

      {/* Tooltip Label */}
      <span className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-800 whitespace-nowrap shadow-xl pointer-events-none">
        Chat with support
      </span>
    </button>
  );
}
