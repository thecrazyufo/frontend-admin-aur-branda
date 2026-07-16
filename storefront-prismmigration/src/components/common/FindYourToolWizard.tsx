import React, { useState, useEffect } from 'react';
import { ToolsAPI } from '@/services/api';
import type { AvailableFormatsResponse, FormatOption, ToolMatchResult } from '@/types/tools';
import { 
  ArrowRight, FileType, Mail, Cloud, Database, 
  FileText, Search, AlertCircle, CheckCircle2,
  ChevronLeft, Loader2, Users, FileSpreadsheet, ShieldAlert,
  Files, Calendar
} from 'lucide-react';

const IconMap: Record<string, React.ReactNode> = {
  'microsoft-outlook': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M1 5L10.5 1.5V22.5L1 19V5Z" fill="#0078D4"/>
      <path d="M10.5 3L23 5V19L10.5 21V3Z" fill="#106EBE"/>
      <path d="M10.5 7.5H20V16.5H10.5V7.5Z" fill="#DEECF9"/>
      <path d="M12.5 9.5H18V11H12.5V9.5ZM12.5 13H18V14.5H12.5V13Z" fill="#106EBE"/>
      <text x="5.5" y="15" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">O</text>
    </svg>
  ),
  'gmail': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EAEAEA"/>
      <path d="M22 6V10L12 15L2 10V6L12 11L22 6Z" fill="#EA4335"/>
      <path d="M2 6V18C2 19.1 2.9 20 4 20H7V11L2 7V6Z" fill="#4285F4"/>
      <path d="M22 6V18C22 19.1 21.1 20 20 20H17V11L22 7V6Z" fill="#34A853"/>
      <path d="M7 20H17V12L12 15.5L7 12V20Z" fill="#FBBC05"/>
    </svg>
  ),
  'google-workspace': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M3 3H10V10H3V3Z" fill="#4285F4"/>
      <path d="M14 3H21V10H14V3Z" fill="#EA4335"/>
      <path d="M3 14H10V21H3V14Z" fill="#FBBC05"/>
      <path d="M14 14H21V21H14V14Z" fill="#34A853"/>
      <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
    </svg>
  ),
  'microsoft-365': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M2 2H11V11H2V2Z" fill="#F25022"/>
      <path d="M13 2H22V11H13V2Z" fill="#7FBA00"/>
      <path d="M2 13H11V22H2V13Z" fill="#00A1F1"/>
      <path d="M13 13H22V22H13V13Z" fill="#FFB900"/>
    </svg>
  ),
  'adobe-pdf': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF0000"/>
      <path d="M12 5C9 5 6 9 6 12C6 15 9 19 12 19C15 19 18 15 18 12C18 9 15 5 12 5ZM12 16.5C10.5 16.5 9 14.5 9 12C9 9.5 10.5 7.5 12 7.5C13.5 7.5 15 9.5 15 12C15 14.5 13.5 16.5 12 16.5Z" fill="#FFFFFF"/>
      <text x="12" y="14.5" fill="#FF0000" fontSize="7" fontWeight="black" textAnchor="middle">PDF</text>
    </svg>
  ),
  'microsoft-excel': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M1 5L10.5 1.5V22.5L1 19V5Z" fill="#107C41"/>
      <path d="M10.5 3L23 5V19L10.5 21V3Z" fill="#1F9A55"/>
      <path d="M12 7H21.5V17H12V7Z" fill="#E2F2E9"/>
      <text x="5.5" y="15" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">X</text>
      <rect x="13.5" y="9.5" width="6" height="1" fill="#107C41"/>
      <rect x="13.5" y="12" width="6" height="1" fill="#107C41"/>
      <rect x="13.5" y="14.5" width="6" height="1" fill="#107C41"/>
    </svg>
  ),
  'microsoft-word': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M1 5L10.5 1.5V22.5L1 19V5Z" fill="#106EBE"/>
      <path d="M10.5 3L23 5V19L10.5 21V3Z" fill="#2B88D8"/>
      <path d="M12 7H21.5V17H12V7Z" fill="#E1F0FC"/>
      <text x="5.5" y="15" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">W</text>
      <rect x="13.5" y="9.5" width="6" height="1" fill="#106EBE"/>
      <rect x="13.5" y="12" width="6" height="1" fill="#106EBE"/>
      <rect x="13.5" y="14.5" width="6" height="1" fill="#106EBE"/>
    </svg>
  ),
  'yahoo': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#6001D2"/>
      <path d="M7 6L11 12V18H13V12L17 6H14.5L12 10.5L9.5 6H7Z" fill="#FFFFFF"/>
      <circle cx="18.5" cy="16.5" r="1.5" fill="#FFFFFF"/>
    </svg>
  ),
  'thunderbird': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0A84FF"/>
      <path d="M12 4C9 4 6 7 6 12C8 11 10 10 12 10C14 10 16 11 18 12C18 7 15 4 12 4Z" fill="#FFFFFF" opacity="0.3"/>
      <path d="M12 6C10 6 7.5 8.5 7.5 12C7.5 15.5 10 18 12 18C14 18 16.5 15.5 16.5 12C16.5 8.5 14 6 12 6ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="#FFFFFF"/>
      <path d="M12 9L15 11L12 13L9 11L12 9Z" fill="#FF9500"/>
    </svg>
  ),
  'google-drive': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M2.5 17L8.5 6.5H15.5L9.5 17H2.5Z" fill="#0066DA"/>
      <path d="M15.5 6.5H22.5L16.5 17H9.5L15.5 6.5Z" fill="#34A853"/>
      <path d="M9.5 17L15.5 6.5H22.5L16.5 17H9.5Z" fill="#FBBC05"/>
      <path d="M9.5 17H2.5L8.5 6.5H15.5L9.5 17Z" fill="#EA4335" opacity="0.2"/>
    </svg>
  ),
  'microsoft-onedrive': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M19.5 11.5C18.5 11.5 17.5 12 17 13C16 11 14 9.5 12 9.5C10.5 9.5 9 10.5 8.5 12C7.5 11 6 10.5 4.5 10.5C2 10.5 0 12.5 0 15C0 17.5 2 19.5 4.5 19.5H19.5C22 19.5 24 17.5 24 15C24 12.5 22 10.5 19.5 11.5Z" fill="#0078D4"/>
      <path d="M19.5 12.5C18.8 12.5 18.2 12.8 17.8 13.4C16.8 11.6 14.8 10.5 12.5 10.5C11 10.5 9.7 11.3 9.1 12.6C8.2 11.8 7 11.5 5.7 11.5C3.7 11.5 2 13.2 2 15.2C2 17.2 3.7 18.9 5.7 18.9H19.5C21.4 18.9 23 17.2 23 15.2C23 13.2 21.4 12.5 19.5 12.5Z" fill="#50D6FE"/>
    </svg>
  ),
  'microsoft-sharepoint': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0072C6"/>
      <circle cx="12" cy="8" r="3" fill="#00B0F0"/>
      <circle cx="8" cy="14" r="3" fill="#00B050"/>
      <circle cx="16" cy="14" r="3" fill="#7030A0"/>
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF"/>
    </svg>
  ),
  'ibm-lotus-notes': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#E2A100"/>
      <path d="M6 12C6 8.7 8.7 6 12 6C15.3 6 18 8.7 18 12C18 13.5 17.5 15 16.5 16L15 14.5C15.6 13.8 16 12.9 16 12C16 9.8 14.2 8 12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C12.9 16 13.8 15.6 14.5 15L16 16.5C15 17.5 13.5 18 12 18C8.7 18 6 15.3 6 12Z" fill="#FFFFFF"/>
    </svg>
  ),
  'zimbra': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#D22D2D"/>
      <path d="M6 6H18V9L13 14L18 19V22H6V19L11 14L6 9V6Z" fill="#FFFFFF"/>
    </svg>
  ),
  'email-file': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M4 2H14L20 8V20C20 21.1 19.1 22 18 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2Z" fill="#0A84FF"/>
      <path d="M14 2V8H20L14 2Z" fill="#50D6FE"/>
      <path d="M6 11H18V13H6V11ZM6 15H18V17H6V15ZM6 7H11V9H6V7Z" fill="#FFFFFF" opacity="0.6"/>
      <path d="M14 10.5L12 12L10 10.5V14.5H14V10.5Z" fill="#FFFFFF"/>
    </svg>
  ),
  'code-file': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M4 2H14L20 8V20C20 21.1 19.1 22 18 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2Z" fill="#3A3F58"/>
      <path d="M14 2V8H20L14 2Z" fill="#6B7280"/>
      <path d="M8 12L5 15L8 18" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12L19 15L16 18" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 11L11 19" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'image-file': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <path d="M4 2H14L20 8V20C20 21.1 19.1 22 18 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2Z" fill="#E02424"/>
      <path d="M14 2V8H20L14 2Z" fill="#FF8A8A"/>
      <circle cx="8" cy="12" r="2" fill="#FFFFFF"/>
      <path d="M6 18L10 14L13 17L18 12L18 18H6Z" fill="#FFFFFF" opacity="0.8"/>
    </svg>
  ),
  'mbox': (
    <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#D97706"/>
      <path d="M2 9H22" stroke="#FFFFFF" strokeWidth="2"/>
      <path d="M7 9V14C7 15.1 7.9 16 9 16H15C16.1 16 17 15.1 17 14V9" fill="#FBBF24"/>
      <circle cx="12" cy="12" r="1.5" fill="#D97706"/>
    </svg>
  ),
  'calendar': <Calendar className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform duration-300" />,
  'contact': <Users className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />,
  'file': <FileText className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
};

function PrismRefractionVisual({ 
  sourceKey, 
  sourceLabel, 
  targetKey,
  allTargets 
}: { 
  sourceKey: string; 
  sourceLabel: string; 
  targetKey: string;
  allTargets: string[];
}) {
  const displayTargets = React.useMemo(() => {
    // Keep targetKey, and include other targets. Limit to 5.
    const list = Array.from(
      new Set([
        targetKey.toLowerCase(), 
        ...allTargets.map(x => x.toLowerCase())
      ])
    ).filter(Boolean).slice(0, 5);
    return list;
  }, [targetKey, allTargets]);

  const N = displayTargets.length;

  return (
    <div className="w-full bg-[#0B0F1A] rounded-xl p-4 my-4 border border-[#334155] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#6366F1]/5 rounded-full blur-2xl pointer-events-none" />

      <svg viewBox="0 0 600 160" className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="inputGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="prismGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.8" />
          </linearGradient>
          <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Source format badge */}
        <g transform="translate(10, 65)">
          <rect x="0" y="0" width="75" height="30" rx="6" fill="#0e0e0e" stroke="#6366F1" strokeWidth="1.5" />
          <text x="37.5" y="19" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" className="uppercase">
            {sourceLabel}
          </text>
        </g>

        {/* Laser line to Prism */}
        <path d="M 85 80 L 220 80" stroke="url(#inputGrad)" strokeWidth="3" fill="none" />
        <circle r="4" fill="#ffffff" filter="url(#activeGlow)">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 85 80 L 220 80" />
        </circle>

        {/* Triangular Prism */}
        <polygon 
          points="250,30 290,110 210,110" 
          fill="url(#prismGrad)" 
          stroke="#6366F1" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
          opacity="0.85"
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <path d="M 220 80 L 250 78 L 275 80" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.9" />

        {/* Refracted Lines & Target Badges */}
        {displayTargets.map((tgt, i) => {
          const isActive = tgt.toLowerCase() === targetKey.toLowerCase();
          const startY = 80;
          const endY = N === 1 ? 80 : 25 + (i * (110 / (N - 1)));
          const endX = 475;

          const spectrumColors = ["#f87171", "#F97316", "#6366F1", "#F97316", "#C026D3"];
          const rayColor = isActive ? "#6366F1" : spectrumColors[i % spectrumColors.length];
          const pathD = `M 275 80 C 335 ${80 + (endY - startY)/3}, 395 ${endY}, ${endX} ${endY}`;

          return (
            <g key={tgt}>
              <path 
                d={pathD} 
                stroke={rayColor} 
                strokeWidth={isActive ? 3 : 1.5} 
                strokeDasharray={isActive ? "none" : "3, 2"}
                fill="none" 
                opacity={isActive ? 1 : 0.4} 
                filter={isActive ? "url(#activeGlow)" : ""}
              />
              <circle r="3" fill="#ffffff" opacity={isActive ? 1 : 0.7}>
                <animateMotion 
                  dur={`${1.8 + i * 0.3}s`} 
                  repeatCount="indefinite" 
                  path={pathD} 
                />
              </circle>

              <g transform={`translate(${endX}, ${endY - 13})`}>
                <rect 
                  x="0" 
                  y="0" 
                  width="80" 
                  height="26" 
                  rx="6" 
                  fill={isActive ? "#1c1917" : "#0e0e0e"} 
                  stroke={isActive ? "#6366F1" : "#262626"} 
                  strokeWidth={isActive ? 1.5 : 1}
                  filter={isActive ? "url(#activeGlow)" : ""}
                />
                <text 
                  x="40" 
                  y="17" 
                  fill={isActive ? "#FFFFFF" : "#a3a3a3"} 
                  fontSize="9" 
                  fontWeight={isActive ? "bold" : "semibold"}
                  textAnchor="middle" 
                  className="uppercase"
                >
                  {tgt}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function FindYourToolWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formats, setFormats] = useState<AvailableFormatsResponse | null>(null);
  const [loadingFormats, setLoadingFormats] = useState(true);
  
  const [source, setSource] = useState<FormatOption | null>(null);
  const [target, setTarget] = useState<FormatOption | null>(null);
  
  // Dynamic capability state — replaces hardcoded email-specific fields
  const [availableCapabilities, setAvailableCapabilities] = useState<string[]>([]);
  const [capabilityLabels, setCapabilityLabels] = useState<Record<string, string>>({});
  const [selectedCapabilities, setSelectedCapabilities] = useState<Record<string, boolean>>({});
  const [loadingCapabilities, setLoadingCapabilities] = useState(false);

  const [matches, setMatches] = useState<ToolMatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    ToolsAPI.getAvailableFormats()
      .then(res => {
        setFormats(res);
        setLoadingFormats(false);
      })
      .catch(err => {
        console.error("Failed to load formats", err);
        setLoadingFormats(false);
      });
  }, []);

  const handleSourceSelect = (option: FormatOption) => {
    setSource(option);
    setStep(2);
  };

  const handleTargetSelect = (option: FormatOption) => {
    setTarget(option);
    setSelectedCapabilities({});
    setStep(3);
    fetchMatches(source!.key, option.key, {});
  };

  const fetchMatches = async (
    srcKey: string, 
    tgtKey: string, 
    caps: Record<string, boolean>
  ) => {
    setLoadingMatches(true);
    try {
      const res = await ToolsAPI.matchTools(
        srcKey, tgtKey,
        caps['supportsMultipleAccounts'],
        caps['supportsBatchCsv'],
        caps['supportsImpersonation']
      );
      setMatches(res);
    } catch (err) {
      console.error("Failed to fetch matches", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const reset = () => {
    setSource(null);
    setTarget(null);
    setAvailableCapabilities([]);
    setCapabilityLabels({});
    setSelectedCapabilities({});
    setStep(1);
    setMatches([]);
  };


  // ── Category icon map ────────────────────────────────────────────────────
  const CategoryIconMap: Record<string, React.ReactNode> = {
    'Email':          <Mail className="w-3.5 h-3.5" />,
    'Cloud Platform': <Cloud className="w-3.5 h-3.5" />,
    'Cloud Storage':  <Cloud className="w-3.5 h-3.5" />,
    'File Format':    <FileText className="w-3.5 h-3.5" />,
    'Calendar':       <Calendar className="w-3.5 h-3.5" />,
    'Contacts':       <Users className="w-3.5 h-3.5" />,
    'Image':          <Files className="w-3.5 h-3.5" />,
    'Database':       <Database className="w-3.5 h-3.5" />,
    'Other':          <FileType className="w-3.5 h-3.5" />,
  };

  const CategorizedFormatGrid = ({ options, onSelect }: { options: FormatOption[], onSelect: (opt: FormatOption) => void }) => {
    const [activeTab, setActiveTab] = React.useState<string>('All');

    if (!options || options.length === 0) {
      return <p className="text-stone-500 text-center py-8">No formats available.</p>;
    }

    // Build ordered category list — preserving insertion order from API
    const categoryOrder: string[] = [];
    const categoryMap: Record<string, FormatOption[]> = {};
    for (const opt of options) {
      const cat = opt.category || opt.vendor || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = [];
        categoryOrder.push(cat);
      }
      categoryMap[cat].push(opt);
    }

    const showTabs = categoryOrder.length > 1;
    const displayOptions = activeTab === 'All' ? options : (categoryMap[activeTab] || options);
    const tabs = ['All', ...categoryOrder];

    return (
      <div className="mt-4">
        {/* Category pill tabs */}
        {showTabs && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {tabs.map(tab => {
              const isActive = activeTab === tab;
              const count = tab === 'All' ? options.length : (categoryMap[tab]?.length ?? 0);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#6366F1] border-[#6366F1] text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                      : 'bg-[#0B0F1A] border-[#334155] text-[#94A3B8] hover:border-[#6366F1]/50 hover:text-white'
                  }`}
                >
                  {tab !== 'All' && (
                    <span className={isActive ? 'text-white' : 'text-[#94A3B8]'}>
                      {CategoryIconMap[tab] || CategoryIconMap['Other']}
                    </span>
                  )}
                  {tab}
                  <span className={`ml-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'text-indigo-200' : 'text-stone-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Format cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => onSelect(opt)}
              className="flex flex-col items-center p-6 bg-[#1E2937]/30 border border-[#334155] hover:border-[#6366F1]/40 hover:bg-[#1E2937]/60 rounded-xl transition-all text-left w-full group animate-in fade-in zoom-in-95 duration-200 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#0B0F1A] border border-[#334155] flex items-center justify-center mb-4 group-hover:bg-[#6366F1]/10 group-hover:border-[#6366F1]/30 transition-all">
                {IconMap[opt.icon] || IconMap['file']}
              </div>
              <h3 className="font-semibold text-white text-sm text-center">{opt.label}</h3>
              <p className="text-xs text-[#94A3B8] mt-1 text-center leading-relaxed line-clamp-2">{opt.description}</p>
              {opt.category && (
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#6366F1]/70 bg-[#6366F1]/5 border border-[#6366F1]/10 px-2 py-0.5 rounded-full">
                  {CategoryIconMap[opt.category] || CategoryIconMap['Other']}
                  {opt.category}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loadingFormats) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mb-4" />
        <p className="text-[#94A3B8]">Loading available platforms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2 px-4 sm:px-6">
      
      {/* Wizard Header / Breadcrumbs */}
      <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
        <div className={`flex items-center ${step === 1 ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 1 ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>1</div>
          <span className="hidden sm:inline">Source</span>
        </div>
        <div className={`w-12 h-0.5 ${step === 2 || step === 3 ? 'bg-[#6366F1]' : 'bg-[#1E2937]'}`}></div>
        <div className={`flex items-center ${step === 2 ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 2 ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>2</div>
          <span className="hidden sm:inline">Destination</span>
        </div>
        <div className={`w-12 h-0.5 ${step === 3 ? 'bg-[#6366F1]' : 'bg-[#1E2937]'}`}></div>
        <div className={`flex items-center ${step === 3 ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 3 ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>3</div>
          <span className="hidden sm:inline">Results</span>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">What are you migrating from?</h2>
            <p className="text-[#E2E8F0] mt-2 text-lg">Select your current data source or format.</p>
          </div>
          <CategorizedFormatGrid options={formats?.sourceFormats || []} onSelect={handleSourceSelect} />
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && source && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-6">
            <button onClick={() => setStep(1)} className="flex items-center text-[#94A3B8] hover:text-[#6366F1] text-sm font-medium transition-colors cursor-pointer bg-transparent border-[#334155]">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Source: {source.label}
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Where are you migrating to?</h2>
            <p className="text-[#E2E8F0] mt-2 text-lg">Select your destination format or platform.</p>
          </div>
          {loadingCapabilities ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mb-4" />
              <p className="text-[#94A3B8]">Checking compatible tools...</p>
            </div>
          ) : (
            <CategorizedFormatGrid options={formats?.targetFormats || []} onSelect={handleTargetSelect} />
          )}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && source && target && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-6 flex justify-between items-center">
            <button 
              onClick={() => setStep(2)} 
              className="flex items-center text-[#94A3B8] hover:text-[#6366F1] text-sm font-medium transition-colors cursor-pointer bg-transparent border-[#334155]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <button onClick={reset} className="text-sm font-bold text-[#6366F1] hover:underline cursor-pointer bg-transparent border-[#334155]">
              Start Over
            </button>
          </div>

          <div className="bg-[#0B0F1A] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 border border-[#334155]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E2937] flex items-center justify-center mb-2 shadow-sm border border-[#334155]">
                {IconMap[source.icon] || IconMap['file']}
              </div>
              <span className="text-xs font-semibold text-white">{source.label}</span>
            </div>
            <ArrowRight className="w-6 h-6 text-stone-600 hidden sm:block" />
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E2937] flex items-center justify-center mb-2 shadow-sm border border-[#334155]">
                {IconMap[target.icon] || IconMap['file']}
              </div>
              <span className="text-xs font-semibold text-white">{target.label}</span>
            </div>
          </div>

          {loadingMatches ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mb-4" />
              <p className="text-[#94A3B8]">Finding the best tools for your migration...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#334155] pb-2">Recommended Tools ({matches.length})</h3>
              {matches.map((match, idx) => (
                <div key={match.product.id} className={`bg-[#1E2937]/30 backdrop-blur rounded-xl border ${match.matchType === 'PERFECT_MATCH' ? 'border-emerald-500/30 shadow-md ring-1 ring-emerald-500/10' : 'border-[#334155] shadow-sm'} p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all hover:border-[#6366F1]/30`}>
                  
                  {/* Badge */}
                  {match.matchType === 'PERFECT_MATCH' && (
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-lg flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> PERFECT MATCH
                    </div>
                  )}
                  {match.matchType === 'EXACT' && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-lg">
                      EXACT MATCH
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-bold text-white">{match.product.name}</h4>
                      {match.matchType !== 'PERFECT_MATCH' && match.matchType !== 'EXACT' && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-stone-450 text-[10px] px-2 py-0.5 rounded font-bold">
                          {match.score}% Compatible
                        </span>
                      )}
                    </div>
                    <p className="text-[#E2E8F0] text-xs mb-4 leading-relaxed">{match.product.shortDescription}</p>
                    
                    {/* Render capabilities tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.product.capabilities?.supportsMultipleAccounts && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#6366F1]" /> Batch Migration
                        </span>
                      )}
                      {match.product.capabilities?.supportsBatchCsv && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-[#6366F1]" /> CSV Import
                        </span>
                      )}
                      {match.product.capabilities?.supportsImpersonation && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-[#6366F1]" /> Impersonation
                        </span>
                      )}
                      {match.product.capabilities?.supportsMultipleFiles && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Files className="w-3 h-3 text-[#6366F1]" /> Convert Multiple Files
                        </span>
                      )}
                      {match.product.capabilities?.extractEmails && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#6366F1]" /> Migrate Emails
                        </span>
                      )}
                      {match.product.capabilities?.extractContacts && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#6366F1]" /> Migrate Contacts
                        </span>
                      )}
                      {match.product.capabilities?.extractCalendars && (
                        <span className="bg-[#0B0F1A] border border-[#334155] text-[#E2E8F0] text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#6366F1]" /> Migrate Calendars
                        </span>
                      )}
                    </div>

                    {/* Prism Refraction Visual rendering */}
                    <PrismRefractionVisual 
                      sourceKey={source.key} 
                      sourceLabel={source.label} 
                      targetKey={target.key} 
                      allTargets={match.product.targetFormats || []} 
                    />

                    <div className="bg-[#0B0F1A] rounded-lg p-3 inline-flex items-center text-xs text-[#E2E8F0] border border-[#334155]">
                      <Search className="w-4 h-4 text-[#6366F1] mr-2 shrink-0" />
                      <span>{match.matchReason}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center shrink-0 border-t md:border-t-0 md:border-l border-[#334155] pt-4 md:pt-0 md:pl-6 gap-3">
                    <a href={`/products/${match.product.slug}`} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold py-2.5 px-6 rounded-lg text-center transition-all duration-300 shadow-[0_0_15px_rgba(99, 102, 241,0.25)] text-xs">
                      View Details
                    </a>
                    {match.product.downloadUrl && (
                      <a href={match.product.downloadUrl} className="bg-[#0B0F1A] border border-[#334155] hover:bg-[#1E2937] text-stone-350 font-bold py-2.5 px-6 rounded-lg text-center transition-colors text-xs">
                        Free Trial
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1E2937]/30 backdrop-blur border border-[#334155] p-8 shadow-2xl">
              <AlertCircle className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No direct tools found</h3>
              <p className="text-[#E2E8F0] max-w-md mx-auto mb-6 text-xs leading-relaxed">
                We couldn't find an automated tool that meets all your selected filter criteria. 
                Try restarting the search without advanced filters or contact our support team.
              </p>
              <button onClick={reset} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold py-2 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(99, 102, 241,0.25)] cursor-pointer text-xs">
                Try Another Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
