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
  'microsoft-outlook': <Mail className="w-8 h-8 text-blue-600" />,
  'gmail': <Mail className="w-8 h-8 text-red-500" />,
  'google': <Cloud className="w-8 h-8 text-yellow-500" />,
  'microsoft': <Cloud className="w-8 h-8 text-blue-600" />,
  'microsoftexchange': <Database className="w-8 h-8 text-blue-800" />,
  'thunderbird': <Mail className="w-8 h-8 text-blue-400" />,
  'mail': <Mail className="w-8 h-8 text-gray-500" />,
  'adobeacrobatreader': <FileText className="w-8 h-8 text-red-600" />,
  'html5': <FileType className="w-8 h-8 text-orange-500" />,
  'microsoftonedrive': <Cloud className="w-8 h-8 text-blue-500" />,
  'microsoftsharepoint': <Database className="w-8 h-8 text-teal-600" />,
  'googledrive': <Cloud className="w-8 h-8 text-green-500" />,
  'file': <FileText className="w-8 h-8 text-gray-500" />
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
  const [step, setStep] = useState<1 | 2 | 'questions' | 3>(1);
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

  const handleTargetSelect = async (option: FormatOption) => {
    setTarget(option);
    setSelectedCapabilities({});

    // Fetch capabilities for this source→target pair to decide if quiz step is needed
    setLoadingCapabilities(true);
    try {
      const capData = await ToolsAPI.getCapabilities(source!.key, option.key);
      setAvailableCapabilities(capData.availableCapabilities);
      setCapabilityLabels(capData.capabilityLabels);
      if (capData.availableCapabilities.length > 0) {
        setStep('questions');
      } else {
        // No capability filters — skip quiz and go straight to results
        setStep(3);
        fetchMatches(source!.key, option.key, {});
      }
    } catch (err) {
      console.error("Failed to fetch capabilities", err);
      // Graceful degradation — skip quiz step on error
      setAvailableCapabilities([]);
      setCapabilityLabels({});
      setStep(3);
      fetchMatches(source!.key, option.key, {});
    } finally {
      setLoadingCapabilities(false);
    }
  };

  const handleQuestionsSubmit = () => {
    setStep(3);
    fetchMatches(source!.key, target!.key, selectedCapabilities);
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


  const FormatGrid = ({ options, onSelect }: { options: FormatOption[], onSelect: (opt: FormatOption) => void }) => {
    if (!options || options.length === 0) {
      return <p className="text-stone-500 text-center py-8">No formats available.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {options.map(opt => (
          <button 
            key={opt.key}
            onClick={() => onSelect(opt)}
            className="flex flex-col items-center p-6 bg-[#1E2937]/30 border border-[#334155] hover:border-[#6366F1]/30 rounded-xl transition-all text-left w-full group animate-in fade-in zoom-in-95 duration-200 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#0B0F1A] border border-[#334155] flex items-center justify-center mb-4 group-hover:bg-[#6366F1]/10 transition-colors">
              {IconMap[opt.icon] || IconMap['file']}
            </div>
            <h3 className="font-semibold text-white text-sm">{opt.label}</h3>
            <p className="text-xs text-[#E2E8F0] mt-1 text-center leading-relaxed">{opt.description}</p>
          </button>
        ))}
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
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Wizard Header / Breadcrumbs */}
      <div className="flex items-center justify-center mb-12 space-x-2 sm:space-x-4">
        <div className={`flex items-center ${step === 1 ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 1 ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>1</div>
          <span className="hidden sm:inline">Source</span>
        </div>
        <div className={`w-12 h-0.5 ${step === 2 || step === 'questions' || step === 3 ? 'bg-[#6366F1]' : 'bg-[#1E2937]'}`}></div>
        <div className={`flex items-center ${step === 2 ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 2 ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>2</div>
          <span className="hidden sm:inline">Destination</span>
        </div>
        
        {/* Dynamic Questions Breadcrumb — only show if capabilities exist */}
        {availableCapabilities.length > 0 && (
          <>
            <div className={`w-12 h-0.5 ${step === 'questions' || step === 3 ? 'bg-[#6366F1]' : 'bg-[#1E2937]'}`}></div>
            <div className={`flex items-center ${step === 'questions' ? 'text-[#6366F1] font-bold' : 'text-[#94A3B8]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[#334155] mr-2 ${step === 'questions' ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]' : 'border-[#334155] text-stone-500'}`}>?</div>
              <span className="hidden sm:inline">Filters</span>
            </div>
          </>
        )}

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
          <FormatGrid options={formats?.sourceFormats || []} onSelect={handleSourceSelect} />
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
            <FormatGrid options={formats?.targetFormats || []} onSelect={handleTargetSelect} />
          )}
        </div>
      )}

      {/* STEP 2.5: DYNAMIC CAPABILITY FILTER QUESTIONS */}
      {step === 'questions' && source && target && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl mx-auto">
          <div className="mb-6">
            <button onClick={() => setStep(2)} className="flex items-center text-[#94A3B8] hover:text-[#6366F1] text-sm font-medium transition-colors cursor-pointer bg-transparent border-[#334155]">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Refine Your Search</h2>
            <p className="text-[#E2E8F0] mt-2 text-sm">Select any special requirements to narrow down the best matching tools.</p>
          </div>

          <div className="space-y-3 bg-[#1E2937]/30 backdrop-blur border border-[#334155] rounded-xl p-6 shadow-2xl">
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Advanced Features Required</p>
            {availableCapabilities.map(capKey => {
              const label = capabilityLabels[capKey] || capKey;
              const isSelected = !!selectedCapabilities[capKey];
              return (
                <button
                  key={capKey}
                  type="button"
                  onClick={() => setSelectedCapabilities(prev => ({ ...prev, [capKey]: !prev[capKey] }))}
                  className={`w-full flex items-center gap-3 p-4 border rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#6366F1] bg-[#6366F1]/10 text-white'
                      : 'border-[#334155] bg-[#0B0F1A] hover:bg-[#1E2937] text-[#E2E8F0]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-[#334155] flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-[#6366F1] bg-[#6366F1]' : 'border-stone-700'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#334155] flex gap-3">
              <button
                onClick={() => {
                  setSelectedCapabilities({});
                  handleQuestionsSubmit();
                }}
                className="flex-1 bg-[#1E2937] hover:bg-stone-800 text-[#E2E8F0] font-bold py-3 rounded-xl transition-colors text-xs cursor-pointer border border-[#334155]"
              >
                Skip — Show All
              </button>
              <button
                onClick={handleQuestionsSubmit}
                className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(99, 102, 241,0.25)] text-xs cursor-pointer"
              >
                Find My Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && source && target && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-6 flex justify-between items-center">
            <button 
              onClick={() => {
                if (availableCapabilities.length > 0) {
                  setStep('questions');
                } else {
                  setStep(2);
                }
              }} 
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
