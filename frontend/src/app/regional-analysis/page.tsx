"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  MapPin, 
  Leaf, 
  BarChart3, 
  Search,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Sparkles,
  BookOpen,
  Download,
  Youtube,
  ExternalLink,
  PlayCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import locationsData from "@/data/locations.json";

interface Recommendation {
  crop: string;
  score: number;
  avg_yield: number;
  stability: string;
  trend: string;
  reason: string;
}

const SEASONS = ["Kharif", "Rabi", "Summer", "Whole Year", "Autumn", "Winter"];

// Custom Select Component for Premium UI
const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon,
  disabled = false 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder: string;
  icon: any;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white border ${isOpen ? 'border-green-500 ring-4 ring-green-500/5' : 'border-gray-100'} rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 group ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-green-500/50 hover:bg-gray-50/50'}`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.length === 0 && (
              <div className="px-5 py-4 text-xs text-gray-400 italic">No options available</div>
            )}
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3.5 text-sm font-semibold flex items-center justify-between transition-colors ${
                  value === option ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option}
                {value === option && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Growth Guide Modal
const GuideModal = ({ 
  isOpen, 
  onClose, 
  crop, 
  content, 
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  crop: string; 
  content: string; 
  loading: boolean;
}) => {
  if (!isOpen) return null;

  // Helper to parse YouTube link
  const getYTLink = (content: string, cropName: string) => {
    const baseQuery = `How to grow ${cropName} in India complete scientific farming guide`;
    const searchMatch = content.match(/YT_SEARCH:\s*\[?(.*?)\]?$/m);
    const finalQuery = searchMatch ? searchMatch[1].replace(/[\[\]]/g, "") : baseQuery;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
  };

  const ytLink = getYTLink(content, crop);
  
  // Clean content from tags
  const cleanContent = content
    .replace(/YT_VIDEO_ID:\s*\[?.*?\]?/g, "")
    .replace(/YT_SEARCH:\s*\[?.*?\]?/g, "")
    .replace(/\d+\.\s*Video Tutorial[\s\S]*$/i, "") // Catch numbered points
    .trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white via-white to-green-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{crop} Growth Guide</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                <BookOpen className="w-3 h-3" /> AI Advisory System
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-12">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-600/30" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800">Gemini is writing...</h3>
                <p className="text-gray-400 text-xs mt-1">Generating full cultivation manual</p>
              </div>
            </div>
          ) : (
            <>
              <div className="prose prose-green max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 selection:bg-green-100">
                <ReactMarkdown>{cleanContent}</ReactMarkdown>
              </div>

              {/* YouTube Video Learning Hub - MOVED TO BOTTOM */}
              <div className="relative group pt-12 border-t border-gray-100">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white border border-red-50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm">
                  <div className="w-full md:w-1/3 aspect-video bg-gray-100 rounded-3xl relative overflow-hidden group/yt cursor-pointer shadow-inner">
                    <img 
                      src={`https://img.youtube.com/vi/f8f-yF1o6f8/0.jpg`}
                      alt="Tutorial"
                      className="w-full h-full object-cover opacity-60 grayscale group-hover/yt:grayscale-0 group-hover/yt:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-200 group-hover/yt:scale-110 transition-transform">
                        <PlayCircle className="w-9 h-9 text-white fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                      <Youtube className="w-3.5 h-3.5" /> Video Advisory
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                      Visual Guide for {crop}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      Watch the complete cultivation masterclass on YouTube to see modern farming techniques in action.
                    </p>
                    <a 
                      href={ytLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 group/link"
                    >
                      Watch Tutorial
                      <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && (
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Generated by Gemini 2.0 Flash
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RegionalAnalysisPage() {
  const { user } = useUser();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");

  // Guide Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [guideContent, setGuideContent] = useState("");
  const [guideLoading, setGuideLoading] = useState(false);

  const states = Object.keys(locationsData).sort();
  const districts = state ? ((locationsData as any)[state] as string[]).sort() : [];

  const handleFetch = async () => {
    if (!state || !district) {
      setError("Please select both State and District");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/recommend?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&season=${encodeURIComponent(season)}&user_id=${user?.id || "guest"}`
      );
      const data = await response.json();
      
      if (data.recommended_crops && data.recommended_crops.length > 0) {
        setRecommendations(data.recommended_crops);
      } else {
        setError("No significant historical data found for this specific region and season.");
        setRecommendations([]);
      }
    } catch (err) {
      setError("Failed to connect to the recommendation engine.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowGuide = async (cropName: string) => {
    setSelectedCrop(cropName);
    setIsModalOpen(true);
    setGuideLoading(true);
    setGuideContent("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/generate-growth-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_name: cropName,
          state: state,
          district: district
        })
      });
      const data = await response.json();
      if (data.success) {
        setGuideContent(data.guide);
      } else {
        setGuideContent("Failed to generate guide. Please try again.");
      }
    } catch (err) {
      setGuideContent("Error connecting to AI Advisory service.");
    } finally {
      setGuideLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Plus_Jakarta_Sans'] selection:bg-green-100 selection:text-green-900">
      
      <GuideModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        crop={selectedCrop} 
        content={guideContent} 
        loading={guideLoading} 
      />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-green-50/50 via-white to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
            <BarChart3 className="w-3.5 h-3.5" /> Intelligence Driven
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-[-0.04em] text-gray-900 leading-[0.95]">
            Regional Analysis <span className="text-green-600">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Discover crops with proven yield stability and growth patterns in your specific district using 20+ years of APY data.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            
            <CustomSelect 
              label="State"
              value={state}
              onChange={(val) => {
                setState(val);
                setDistrict("");
              }}
              options={states}
              placeholder="Choose State"
              icon={MapPin}
            />

            <CustomSelect 
              label="District"
              value={district}
              onChange={setDistrict}
              options={districts}
              placeholder="Choose District"
              icon={BarChart3}
              disabled={!state}
            />

            <CustomSelect 
              label="Season"
              value={season}
              onChange={setSeason}
              options={SEASONS}
              placeholder="Select Season"
              icon={Leaf}
            />

            <button 
              onClick={handleFetch}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-wider py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-[0_15px_35px_-5px_rgba(22,163,74,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 h-[58px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Search className="w-5 h-5" /> Start Analysis</>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-4 text-red-600 bg-red-50 p-5 rounded-2xl border border-red-100 font-bold text-sm">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
              </div>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        {!loading && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className="group bg-white border border-gray-100 rounded-[3rem] p-10 hover:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="w-16 h-16 bg-green-600 rounded-[22px] flex items-center justify-center shadow-xl shadow-green-100 group-hover:rotate-6 transition-transform">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-3xl font-black mb-4 text-gray-900 group-hover:text-green-600 transition-colors relative z-10 tracking-tight">{rec.crop}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-10 flex-grow relative z-10 font-medium">
                  {rec.reason}
                </p>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Yield</span>
                    </div>
                    <span className="text-xl font-black text-gray-900">{rec.avg_yield} <span className="text-[10px] font-black text-gray-400">T/Ha</span></span>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stability</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      rec.stability === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rec.stability}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleShowGuide(rec.crop)}
                    className="w-full mt-6 flex items-center justify-center gap-2 group/btn py-2 text-[11px] font-black uppercase tracking-[0.2em] text-green-600 hover:text-green-700 transition-colors border-t border-gray-100 pt-6"
                  >
                    Full Growth Guide
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="max-w-2xl mx-auto text-center py-32 bg-gray-50/40 rounded-[4rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-50">
              <BarChart3 className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Ready for Insights?</h2>
            <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
              Select a location above to reveal proven success patterns and recommended crops.
            </p>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        
        .prose h1, .prose h2, .prose h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose p {
          margin-bottom: 1em;
        }
        .prose ul {
          margin-bottom: 1em;
          padding-left: 1.5em;
          list-style-type: disc;
        }
        .prose li {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}
