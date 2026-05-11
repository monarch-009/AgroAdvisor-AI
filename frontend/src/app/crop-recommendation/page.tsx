"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sprout, Send, Trophy, CheckCircle, AlertTriangle, Thermometer, 
  Droplets, FlaskConical, CloudRain, Atom, TestTubes, Beaker,
  Search, RefreshCw, Activity, ArrowRight, MapPin, ChevronDown, X,
  Youtube, ExternalLink, PlayCircle, Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  predictCrop, 
  predictCropByLocation, 
  generateGrowthGuide,
  CropInput, 
  LocationCropInput, 
  CropResult,
  fetchSoilData,
  getWeather
} from "../../services/api";
import { useUser } from "@clerk/nextjs";
import locationsRaw from "../../data/locations.json";
import { tehsilData } from "../../data/tehsilMapping";

const locationData = locationsRaw as Record<string, string[]>;
const statesList = Object.keys(locationData);

function CustomSelect({ 
  value, 
  options, 
  onChange, 
  placeholder = "Select..." 
}: { 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="w-full bg-transparent text-lg font-black text-gray-900 outline-none cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <div className={`transition-transform duration-200 text-gray-400 group-focus-within:text-green-600 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white border-2 border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 max-h-64 overflow-y-auto p-2 scrollbar-hide">
          {options.map((opt) => (
            <div 
              key={opt}
              className={`px-4 py-3 cursor-pointer text-sm font-bold rounded-xl transition-all ${
                value === opt ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CropRecommendationPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"soil" | "location">("soil");
  
  const [form, setForm] = useState<CropInput>({
    N: 90, P: 42, K: 43,
    temperature: 20.8, humidity: 82, ph: 6.5, rainfall: 202.9,
  });

  const [locationForm, setLocationForm] = useState({
    state: statesList[0], 
    district: locationData[statesList[0]][0],
    tehsil: "",
    village: ""
  });
  const [results, setResults] = useState<CropResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  
  // AI Growth Guide State
  const [showGuide, setShowGuide] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [guideContent, setGuideContent] = useState<string | null>(null);

  const fields: { key: keyof CropInput; label: string; unit: string; min: number; max: number; icon: any; step?: number }[] = [
    { key: "N", label: "Nitrogen (N)", unit: "kg/ha", min: 0, max: 500, icon: FlaskConical, step: 0.1 },
    { key: "P", label: "Phosphorus (P)", unit: "kg/ha", min: 0, max: 500, icon: TestTubes, step: 0.1 },
    { key: "K", label: "Potassium (K)", unit: "kg/ha", min: 0, max: 500, icon: Beaker, step: 0.1 },
    { key: "ph", label: "Soil pH", unit: "pH", min: 0, max: 14, icon: Atom, step: 0.1 },
    { key: "temperature", label: "Temperature", unit: "°C", min: -20, max: 60, icon: Thermometer, step: 0.1 },
    { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, icon: Droplets, step: 0.1 },
    { key: "rainfall", label: "Rainfall", unit: "mm", min: 0, max: 3000, icon: CloudRain, step: 0.1 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      if (activeTab === "soil") {
        const res = await predictCrop({ ...form, user_id: user?.id || "guest" });
        setResults(res.recommendations);
      } else {
        const res = await predictCropByLocation({ ...locationForm, user_id: user?.id || "guest" });
        setResults(res.recommendations);
      }
    } catch (err: unknown) {
      setError("Analysis failed. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSoil = async () => {
    if (!locationForm.village) {
      setError("Please enter village name to fetch data");
      return;
    }
    setFetchLoading(true);
    setError("");
    try {
      const res = await fetchSoilData({
        state: "", // State and District are now inferred by the backend
        district: "",
        village: locationForm.village
      });
      if (res.success) {
        setForm({
          ...form,
          N: res.data.N,
          P: res.data.P,
          K: res.data.K,
          ph: res.data.ph,
          rainfall: res.data.rainfall,
        });
        setActiveTab("soil");
      }

      // ── Fetch Weather Data ──────────────────────────────────────
      try {
        const weather = await getWeather(locationForm.village);
        if (weather) {
          setForm(prev => ({
            ...prev,
            temperature: weather.temperature,
            humidity: weather.humidity
          }));
        }
      } catch (wErr) {
        console.warn("Weather fetch failed, keeping manual values:", wErr);
      }
    } catch (err) {
      setError("Failed to fetch soil data. Please try manual entry.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleViewGuide = async () => {
    if (!results || results.length === 0) return;
    const topCrop = results[0].crop;
    
    setIsGuideLoading(true);
    setShowGuide(true);
    setGuideContent(null);
    
    try {
      const res = await generateGrowthGuide({
        crop_name: topCrop,
        state: activeTab === "location" ? locationForm.state : undefined,
        district: activeTab === "location" ? locationForm.district : undefined
      });
      setGuideContent(res.guide);
    } catch (err) {
      setGuideContent("## Error\nFailed to generate the growth guide. Please try again later.");
    } finally {
      setIsGuideLoading(false);
    }
  };

  // Helper to parse YouTube search link
  const getYTLink = (content: string | null, crop: string) => {
    const baseQuery = `How to grow ${crop} in India complete scientific farming guide`;
    if (!content) return `https://www.youtube.com/results?search_query=${encodeURIComponent(baseQuery)}`;
    
    const searchMatch = content.match(/YT_SEARCH:\s*\[?(.*?)\]?$/m);
    const finalQuery = searchMatch ? searchMatch[1].replace(/[\[\]]/g, "") : baseQuery;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
  };

  const cleanGuideContent = (content: string | null) => {
    if (!content) return "";
    return content
      .replace(/YT_VIDEO_ID:\s*\[?.*?\]?/g, "")
      .replace(/YT_SEARCH:\s*\[?.*?\]?/g, "")
      // Also catch numbered points like "9. Video Tutorial" if Gemini outputs them
      .replace(/\d+\.\s*Video Tutorial[\s\S]*$/i, "") 
      .trim();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12">
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="mb-12 animate-in text-center sm:text-left">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Crop Recommendation</h1>
        <p className="text-gray-500 font-medium">Input your soil profile and climate data to discover the most profitable crops for your land</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* ── Left Column: Input Form ───────────────────────────── */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              {activeTab === "soil" ? <Activity size={24} /> : <MapPin size={24} />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Step 01</p>
              <h2 className="text-xl font-extrabold text-gray-900">
                {activeTab === "soil" ? "Soil & Climate Data" : "Location Data"}
              </h2>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => { setActiveTab("soil"); setResults(null); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                activeTab === "soil" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              SOIL ANALYSIS
            </button>
            <button
              onClick={() => { setActiveTab("location"); setResults(null); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                activeTab === "location" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              REGION ANALYSIS
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "soil" && (
              <div className="space-y-6 animate-in">
                {/* ── Auto-fill Section ──────────────────────────── */}
                <div className="bg-green-50/50 p-6 rounded-3xl border-2 border-green-100/50">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">Auto-fill from Village</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter your village name..."
                      className="flex-1 bg-white px-5 py-4 rounded-2xl border-2 border-transparent focus:border-green-500 outline-none text-base font-bold shadow-sm placeholder:text-gray-200"
                      value={locationForm.village}
                      onChange={(e) => setLocationForm({ ...locationForm, village: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={handleFetchSoil}
                      className="bg-green-600 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100"
                      disabled={fetchLoading}
                    >
                      {fetchLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                      Fetch Data
                    </button>
                  </div>

                </div>

                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">OR MANUAL ENTRY</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                {/* ── Manual Fields ──────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.key} className="bg-gray-50/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all group">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                          <Icon size={12} className="group-focus-within:text-green-600" />
                          {field.label}
                          <span className="opacity-50 lowercase font-bold">({field.unit})</span>
                        </label>
                        <input
                          type="number"
                          className="w-full bg-transparent text-lg font-black text-gray-900 outline-none"
                          value={form[field.key]}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          onChange={(e) => setForm({ ...form, [field.key]: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-6 animate-in">

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all group relative">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      <MapPin size={12} className="group-focus-within:text-green-600" />
                      State
                    </label>
                    <CustomSelect
                      value={locationForm.state}
                      options={statesList}
                      onChange={(newState) => setLocationForm({ ...locationForm, state: newState, district: locationData[newState][0] || "" })}
                    />
                  </div>
                  
                  <div className="bg-gray-50/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all group relative">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      <MapPin size={12} className="group-focus-within:text-green-600" />
                      District
                    </label>
                    <CustomSelect
                      value={locationForm.district}
                      options={locationData[locationForm.state] || []}
                      onChange={(newDistrict) => setLocationForm({ ...locationForm, district: newDistrict, tehsil: "" })}
                    />
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all group relative">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      <MapPin size={12} className="group-focus-within:text-green-600" />
                      Tehsil
                    </label>
                    <CustomSelect
                      value={locationForm.tehsil}
                      options={tehsilData[locationForm.district.toUpperCase()] || tehsilData[locationForm.district] || []}
                      onChange={(newTehsil) => setLocationForm({ ...locationForm, tehsil: newTehsil })}
                      placeholder="Select tehsil..."
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200 active:scale-[0.98] mt-4"
              disabled={loading}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Analyzing Profile..." : "Get Recommendations"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>

        {/* ── Right Column: AI Insights ─────────────────────────── */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-2 min-h-[500px]">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Step 02</p>
              <h2 className="text-xl font-extrabold text-gray-900">AI Recommendation</h2>
            </div>
          </div>

          {!results && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                <Search size={32} />
              </div>
              <p className="text-sm font-bold text-gray-300">Submit soil data to view top crop matches</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
               <div className="w-20 h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-6" />
               <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Neural Network Processing...</p>
               <p className="text-xs text-gray-400 font-medium mt-2">Computing optimal growth probability across 100+ specialized crops</p>
            </div>
          )}

          {results && (
            <div className="animate-in space-y-4">
              {results.map((r, i) => (
                <div 
                  key={r.crop}
                  className={`p-6 rounded-3xl border-2 transition-all ${
                    i === 0 
                      ? 'bg-green-50 border-green-100 shadow-lg shadow-green-100/20' 
                      : 'bg-white border-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        i === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {i === 0 ? <Trophy size={20} /> : <CheckCircle size={20} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-gray-900 capitalize">{r.crop}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {i === 0 ? "Best Match" : `Alternative #${i+1}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-xl font-black ${i === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                         {(r.confidence * 100).toFixed(1)}%
                       </p>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Confidence</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-green-600' : 'bg-gray-400'}`} 
                      style={{ width: `${r.confidence * 100}%` }} 
                    />
                  </div>
                </div>
              ))}

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready to proceed?</p>
                 <button 
                   onClick={handleViewGuide}
                   className="flex items-center gap-2 text-xs font-black text-green-600 hover:gap-3 transition-all cursor-pointer"
                 >
                    VIEW GROWTH GUIDE <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── AI Growth Guide Modal ────────────────────────────── */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <Sprout size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AI Growth Guide</h3>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Powered by Gemini 2.0 Flash</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowGuide(false); setGuideContent(null); }}
                className="p-3 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide space-y-10">
              
              {isGuideLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-6" />
                  <h4 className="text-base font-black text-gray-900 uppercase tracking-widest mb-1">Analyzing Agronomy...</h4>
                  <p className="text-xs text-gray-400 font-medium">Gemini AI is crafting a custom cultivation strategy</p>
                </div>
              ) : (
                <>
                  <div className="markdown-content max-w-none prose prose-green prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-li:text-gray-600">
                    <style jsx global>{`
                      .markdown-content h1 { font-size: 2.25rem; margin-bottom: 1.5rem; font-weight: 900; color: #111827; line-height: 1.2; }
                      .markdown-content h2 { font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1.25rem; font-weight: 900; color: #111827; border-left: 4px solid #16a34a; padding-left: 1rem; }
                      .markdown-content h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 900; color: #111827; }
                      .markdown-content p { margin-bottom: 1.25rem; line-height: 1.8; color: #374151; font-size: 1rem; }
                      .markdown-content ul, .markdown-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: disc; }
                      .markdown-content li { margin-bottom: 0.75rem; color: #374151; line-height: 1.6; }
                      .markdown-content strong { color: #111827; font-weight: 800; }
                      
                      .markdown-content table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 2rem 0; border: 2px solid #f3f4f6; border-radius: 1rem; overflow: hidden; }
                      .markdown-content th { background-color: #f9fafb; color: #111827; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 1rem; text-align: left; border-bottom: 2px solid #f3f4f6; }
                      .markdown-content td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 0.9375rem; line-height: 1.5; vertical-align: top; }
                      .markdown-content tr:last-child td { border-bottom: none; }
                      .markdown-content tr:hover td { background-color: #fcfdfc; }
                      
                      .markdown-content blockquote { margin: 2rem 0; padding: 1.5rem; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 1rem 1rem 0; font-style: italic; color: #166534; }
                      .markdown-content blockquote p { margin-bottom: 0; font-weight: 600; }
                    `}</style>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanGuideContent(guideContent)}</ReactMarkdown>
                  </div>

                  {/* YouTube Video Learning Hub - MOVED TO BOTTOM */}
                  <div className="relative group pt-12 border-t border-gray-100">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
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
                          Visual Guide for {results?.[0]?.crop || "Selected Crop"}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                          Watch the complete cultivation masterclass on YouTube to see modern farming techniques in action.
                        </p>
                        <a 
                          href={getYTLink(guideContent, results?.[0]?.crop || "")}
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
            
            <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                    Verified for {results?.[0]?.crop || "Selected Crop"} • Growth Score: {(results?.[0]?.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <button 
                  onClick={() => { setShowGuide(false); setGuideContent(null); }}
                  className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
                >
                  Got it, close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
