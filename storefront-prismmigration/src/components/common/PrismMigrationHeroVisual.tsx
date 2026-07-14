import React from 'react';

interface PrismMigrationHeroVisualProps {
  sourceFormats: string[];
  targetFormats: string[];
}

/** Prettify raw format keys → display labels */
function formatLabel(raw: string): string {
  const MAP: Record<string, string> = {
    pst: "PST", ost: "OST", mbox: "MBOX", eml: "EML", msg: "MSG",
    emlx: "EMLX", nsf: "NSF", olm: "OLM", dbx: "DBX", vcf: "VCF",
    ics: "ICS", csv: "CSV", pdf: "PDF", html: "HTML", rtf: "RTF",
    gmail: "Gmail", google_workspace: "Workspace", exchange: "Exchange",
    office365: "Office 365", outlook: "Outlook", lotus_notes: "Lotus Notes",
    zimbra: "Zimbra", thunderbird: "Thunderbird", imap: "IMAP",
    yahoo: "Yahoo Mail", hotmail: "Hotmail", live: "Live Mail",
    aol: "AOL", apple_mail: "Apple Mail", entourage: "Entourage",
    groupwise: "GroupWise", sharepoint: "SharePoint", onedrive: "OneDrive",
    dropbox: "Dropbox", aws_s3: "AWS S3", azure: "Azure Blob",
  };
  return MAP[raw.toLowerCase()] ?? raw.toUpperCase();
}

/** Assign a subtle color class per format type */
function formatColorClass(raw: string): { border: string; text: string; bg: string; dot: string; glow: string } {
  const r = raw.toLowerCase();
  if (["pst", "ost", "outlook", "msg", "olm"].includes(r)) {
    return {
      border: "border-blue-550/30 dark:border-blue-500/20",
      text: "text-blue-450 dark:text-blue-400",
      bg: "bg-blue-500/10",
      dot: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.4)"
    };
  }
  if (["gmail", "google_workspace"].includes(r)) {
    return {
      border: "border-red-550/30 dark:border-red-500/20",
      text: "text-red-450 dark:text-red-405",
      bg: "bg-red-500/10",
      dot: "#ef4444",
      glow: "rgba(239, 68, 68, 0.4)"
    };
  }
  if (["exchange", "office365", "sharepoint", "onedrive"].includes(r)) {
    return {
      border: "border-sky-550/30 dark:border-sky-500/20",
      text: "text-sky-450 dark:text-sky-400",
      bg: "bg-sky-500/10",
      dot: "#0ea5e9",
      glow: "rgba(14, 165, 233, 0.4)"
    };
  }
  if (["mbox", "eml", "emlx", "thunderbird", "imap"].includes(r)) {
    return {
      border: "border-amber-550/30 dark:border-amber-500/20",
      text: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
      dot: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.4)"
    };
  }
  if (["pdf", "html", "csv"].includes(r)) {
    return {
      border: "border-emerald-550/30 dark:border-emerald-500/20",
      text: "text-emerald-500 dark:text-emerald-450",
      bg: "bg-emerald-500/10",
      dot: "#10b981",
      glow: "rgba(16, 185, 129, 0.4)"
    };
  }
  return {
    border: "border-purple-550/30 dark:border-purple-500/20",
    text: "text-purple-450 dark:text-purple-400",
    bg: "bg-purple-500/10",
    dot: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)"
  };
}

export default function PrismMigrationHeroVisual({ sourceFormats = [], targetFormats = [] }: PrismMigrationHeroVisualProps) {
  const sources = sourceFormats.length > 0 ? sourceFormats : ["pst", "ost"];
  const targets = targetFormats.length > 0 ? targetFormats : ["gmail", "office365", "mbox", "pdf", "html", "csv"];

  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-gradient-to-b from-[#080B16] to-[#03040A] border border-[#202740] rounded-2xl p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col gap-6 select-none">
      
      {/* High-fidelity glowing grid background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #4F46E5 1px, transparent 1px),
            linear-gradient(to bottom, #4F46E5 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Outer ambient glow spots */}
      <div className="absolute top-1/6 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-1/6 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

      {/* Header status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A354D]/30 z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-450 dark:text-indigo-400">
            PRISM ENGINE v2.0: HOLO-REFRACTION LABS
          </span>
        </div>
        <div className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
          status: fully active
        </div>
      </div>

      {/* Simulator Layout */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center gap-6 z-10">
        
        {/* ── LEFT: INPUT ARCHIVES (3 columns span) ── */}
        <div className="md:col-span-3 flex flex-col gap-3 h-full justify-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold mb-1 text-center md:text-left">
            Source Archives
          </div>
          <div className="flex flex-row md:flex-col flex-wrap gap-2 justify-center md:justify-start">
            {sources.map((s, idx) => {
              const colors = formatColorClass(s);
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-[#0B0F1A]/85 backdrop-blur-md ${colors.border} shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:border-indigo-500/50 hover:shadow-indigo-500/5 transition-all duration-300 w-24 md:w-full max-w-[140px] ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: isVisible ? `${idx * 150}ms` : '0ms'
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 animate-ping" style={{ backgroundColor: colors.dot }} />
                  <span className={`text-[10px] font-extrabold font-mono tracking-wider ${colors.text}`}>
                    {formatLabel(s)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: HIGH-FIDELITY ANIMATED CRYSTAL PRISM (5 columns span) ── */}
        <div className="md:col-span-5 flex justify-center py-2 relative">
          <svg viewBox="0 0 320 200" className="w-full h-auto overflow-visible drop-shadow-[0_0_24px_rgba(99,102,241,0.3)]">
            <style>{`
              @keyframes laserFlow {
                to { stroke-dashoffset: -40; }
              }
              @keyframes drawRay {
                from { stroke-dashoffset: 150; }
                to { stroke-dashoffset: 0; }
              }
              .draw-ray-active {
                stroke-dasharray: 150;
                stroke-dashoffset: 150;
                animation: drawRay 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              @keyframes crystalRotation {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.05); }
                100% { transform: rotate(360deg) scale(1); }
              }
              @keyframes spectrumPulse {
                0%, 100% { opacity: 0.6; stroke-width: 2.2; }
                50% { opacity: 0.95; stroke-width: 3.5; }
              }
              @keyframes floatParticle {
                0% { offset-distance: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { offset-distance: 100%; opacity: 0; }
              }
              @keyframes hudPulse {
                0%, 100% { transform: scale(1); opacity: 0.25; }
                50% { transform: scale(1.08); opacity: 0.45; }
              }
              .laser-line {
                stroke-dasharray: 8 6;
                animation: laserFlow 1.2s linear infinite;
              }
              .crystal-prism {
                transform-origin: 160px 100px;
                animation: crystalRotation 10s ease-in-out infinite;
              }
              .spectrum-line {
                animation: spectrumPulse 2.5s ease-in-out infinite;
              }
              .particle-dot {
                animation: floatParticle 3s linear infinite;
              }
              .hud-ring {
                transform-origin: 160px 100px;
                animation: hudPulse 4s ease-in-out infinite;
              }
              .hud-orbit {
                transform-origin: 160px 100px;
                animation: crystalRotation 25s linear infinite;
              }
            `}</style>

            <defs>
              {/* Volumetric Rainbow Light Fan Gradient */}
              <radialGradient id="rainbowFan" cx="0%" cy="50%" r="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="20%" stopColor="#A855F7" stopOpacity="0.15" />
                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.1" />
                <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
              </radialGradient>

              {/* Glass Crystal Gradients */}
              <linearGradient id="crystalLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="crystalRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF00F5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="crystalBottomLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#312E81" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="crystalBottomRight" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.5" />
              </linearGradient>

              {/* Laser input / output gradients */}
              <linearGradient id="laserInGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.1" />
                <stop offset="60%" stopColor="#818CF8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>

              {/* Spectrum refract output gradients */}
              <linearGradient id="specRed" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#EF4444" /></linearGradient>
              <linearGradient id="specOrange" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#F97316" /></linearGradient>
              <linearGradient id="specYellow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
              <linearGradient id="specGreen" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#10B981" /></linearGradient>
              <linearGradient id="specBlue" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
            </defs>

            {/* Glowing background volumetric dispersion fan */}
            <path d="M 160,100 L 320,10 L 320,190 Z" fill="url(#rainbowFan)" className="spectrum-line" style={{ filter: 'blur(4px)' }} />

            {/* Holographic sci-fi HUD ring display */}
            <circle cx="160" cy="100" r="54" className="hud-ring" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="30 10 5 10" />
            <circle cx="160" cy="100" r="46" className="hud-orbit" fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1.5" strokeDasharray="6 24" />

            {/* 1. INPUT LASER BEAM (White hot light coming from left to prism left face) */}
            <path id="pathLaserIn" d="M 10,100 L 138,100" stroke="url(#laserInGrad)" strokeWidth="4.5" fill="none" />
            <path d="M 10,100 L 138,100" className="laser-line" stroke="#E2E8F0" strokeWidth="2" fill="none" />

            {/* 2. SPECTRUM REFRACT LIGHT BEAMS (Fanning out from right face to nodes area) */}
            <path id="pathRed" d="M 172,100 Q 230,85 310,40" className={`spectrum-line ${isVisible ? 'draw-ray-active' : ''}`} stroke="url(#specRed)" strokeWidth="2.8" fill="none" style={{ animationDelay: isVisible ? `${sources.length * 150 + 100}ms` : '0s' }} />
            <path id="pathOrange" d="M 172,100 Q 230,95 310,70" className={`spectrum-line ${isVisible ? 'draw-ray-active' : ''}`} stroke="url(#specOrange)" strokeWidth="2.8" fill="none" style={{ animationDelay: isVisible ? `${sources.length * 150 + 180}ms` : '0s' }} />
            <path id="pathYellow" d="M 172,100 Q 230,100 310,100" className={`spectrum-line ${isVisible ? 'draw-ray-active' : ''}`} stroke="url(#specYellow)" strokeWidth="2.8" fill="none" style={{ animationDelay: isVisible ? `${sources.length * 150 + 260}ms` : '0s' }} />
            <path id="pathGreen" d="M 172,100 Q 230,105 310,130" className={`spectrum-line ${isVisible ? 'draw-ray-active' : ''}`} stroke="url(#specGreen)" strokeWidth="2.8" fill="none" style={{ animationDelay: isVisible ? `${sources.length * 150 + 340}ms` : '0s' }} />
            <path id="pathBlue" d="M 172,100 Q 230,110 310,160" className={`spectrum-line ${isVisible ? 'draw-ray-active' : ''}`} stroke="url(#specBlue)" strokeWidth="2.8" fill="none" style={{ animationDelay: isVisible ? `${sources.length * 150 + 420}ms` : '0s' }} />

            {/* Glowing animated flow particles on paths */}
            <circle r="4.5" fill="#EF4444" className="particle-dot" style={{ motionPath: "path('M 172,100 Q 230,85 310,40')", animationDelay: '0s', filter: 'drop-shadow(0 0 4px #EF4444)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', transitionDelay: `${sources.length * 150 + 500}ms` }} />
            <circle r="4.5" fill="#F97316" className="particle-dot" style={{ motionPath: "path('M 172,100 Q 230,95 310,70')", animationDelay: '0.8s', filter: 'drop-shadow(0 0 4px #F97316)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', transitionDelay: `${sources.length * 150 + 500}ms` }} />
            <circle r="4.5" fill="#F59E0B" className="particle-dot" style={{ motionPath: "path('M 172,100 Q 230,100 310,100')", animationDelay: '1.6s', filter: 'drop-shadow(0 0 4px #F59E0B)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', transitionDelay: `${sources.length * 150 + 500}ms` }} />
            <circle r="4.5" fill="#10B981" className="particle-dot" style={{ motionPath: "path('M 172,100 Q 230,105 310,130')", animationDelay: '0.4s', filter: 'drop-shadow(0 0 4px #10B981)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', transitionDelay: `${sources.length * 150 + 500}ms` }} />
            <circle r="4.5" fill="#3B82F6" className="particle-dot" style={{ motionPath: "path('M 172,100 Q 230,110 310,160')", animationDelay: '1.2s', filter: 'drop-shadow(0 0 4px #3B82F6)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', transitionDelay: `${sources.length * 150 + 500}ms` }} />

            {/* 3. THE 3D GLASS CRYSTAL DIAMOND (Refracting centerpiece) */}
            <g className="crystal-prism" style={{ filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.45))' }}>
              {/* Outer holographic edge lines */}
              <polygon points="160,45 130,100 160,103" fill="url(#crystalLeft)" stroke="#E0E7FF" strokeWidth="0.6" strokeOpacity="0.4" />
              <polygon points="160,45 190,100 160,103" fill="url(#crystalRight)" stroke="#E0E7FF" strokeWidth="0.6" strokeOpacity="0.4" />
              <polygon points="160,155 130,100 160,103" fill="url(#crystalBottomLeft)" stroke="#E0E7FF" strokeWidth="0.6" strokeOpacity="0.3" />
              <polygon points="160,155 190,100 160,103" fill="url(#crystalBottomRight)" stroke="#E0E7FF" strokeWidth="0.6" strokeOpacity="0.3" />

              {/* Spectral Core Core */}
              <circle cx="160" cy="100" r="4.5" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 8px #FFFFFF)' }} />
            </g>
          </svg>
        </div>

        {/* ── RIGHT: OUTPUT FORMATS GRID (4 columns span - RENDERS ALL!) ── */}
        <div className="md:col-span-4 flex flex-col gap-3 h-full justify-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold mb-1 text-center md:text-left">
            Refracted Targets ({targets.length} Supported)
          </div>
          {/* Dense, responsive grid layout designed to fit 20+ targets perfectly without bloat */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 select-none custom-scrollbar">
            {targets.map((t, idx) => {
              const colors = formatColorClass(t);
              return (
                <div
                  key={t}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#0B0F1A]/85 backdrop-blur-md ${colors.border} ${colors.bg} hover:border-[#6366F1]/55 hover:scale-[1.03] transition-all duration-200 shadow-sm ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: isVisible ? `${sources.length * 150 + 500 + idx * 80}ms` : '0ms'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: colors.dot }} />
                  <span className={`text-[9px] font-bold font-mono tracking-wider ${colors.text} truncate`}>
                    {formatLabel(t)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Decorative spectrum neon line at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-red-500 via-yellow-500 to-indigo-500 opacity-30" />
    </div>
  );
}
