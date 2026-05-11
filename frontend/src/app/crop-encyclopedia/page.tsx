"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronRight, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Clock, 
  MapPin, 
  Info,
  X,
  Sprout,
  ArrowRight,
  Wind,
  Layers,
  Zap,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Briefcase,
  Waves,
  Hammer,
  Activity,
  Gem,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cropsData } from "../../data/cropsData";

// --- Advanced Icon & Color Mapping ---
const getSectionTheme = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes("climate") || k.includes("condition") || k.includes("temp")) 
    return { icon: <Thermometer size={20} />, bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" };
  if (k.includes("soil")) 
    return { icon: <Layers size={20} />, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" };
  if (k.includes("irrigation") || k.includes("water")) 
    return { icon: <Waves size={20} />, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
  if (k.includes("pest") || k.includes("disease")) 
    return { icon: <ShieldCheck size={20} />, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" };
  if (k.includes("harvest")) 
    return { icon: <TrendingUp size={20} />, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" };
  if (k.includes("economic") || k.includes("profit") || k.includes("market") || k.includes("roi")) 
    return { icon: <Briefcase size={20} />, bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" };
  if (k.includes("prep") || k.includes("technique") || k.includes("sowing") || k.includes("cultivation")) 
    return { icon: <Hammer size={20} />, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  if (k.includes("tip")) 
    return { icon: <Lightbulb size={20} />, bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" };
  if (k.includes("scheme")) 
    return { icon: <Zap size={20} />, bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" };
  return { icon: <Sprout size={20} />, bg: "bg-green-50", text: "text-green-600", border: "border-green-100" };
};

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1') 
    .replace(/^./, (str) => str.toUpperCase()) 
    .replace(/_/g, ' '); 
};

// --- Polished Recursive Data Renderer ---
const DataRenderer = ({ label, value, depth = 0 }: { label?: string, value: any, depth?: number }) => {
  if (value === null || value === undefined) return null;

  // 1. Primitive Values (Strings, Numbers)
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-2 border-b border-gray-50 last:border-0`}>
        {label && (
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
            {formatKey(label)}
          </span>
        )}
        <span className={`${depth === 0 ? 'text-base' : 'text-sm'} font-bold text-gray-800 text-right`}>
          {String(value)}
        </span>
      </div>
    );
  }

  // 2. Arrays (Rendered as Timelines or Tag Clouds)
  if (Array.isArray(value)) {
    const isTimeline = label?.toLowerCase().includes("schedule") || label?.toLowerCase().includes("stage") || label?.toLowerCase().includes("prep");
    
    return (
      <div className="mt-4">
        {label && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{formatKey(label)}</p>}
        <div className={`space-y-6 ${isTimeline ? 'relative pl-6 border-l-2 border-green-100 py-2' : ''}`}>
          {value.map((item, i) => (
            <div key={i} className="relative group/item">
              {isTimeline && (
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white bg-green-500 shadow-sm group-hover/item:scale-125 transition-transform" />
              )}
              <div className={`p-4 rounded-2xl ${depth === 0 ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-50/50'}`}>
                {typeof item === 'object' ? (
                  <DataRenderer value={item} depth={depth + 1} />
                ) : (
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">{item}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Objects (Rendered as Groups)
  if (typeof value === 'object') {
    return (
      <div className={`space-y-2 ${depth > 0 ? 'mt-4' : ''}`}>
        {label && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{formatKey(label)}</p>}
        <div className={`grid grid-cols-1 gap-4`}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className={`${depth === 0 ? 'p-0' : 'pl-4 border-l-2 border-gray-100'}`}>
              <DataRenderer label={k} value={v} depth={depth + 1} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function CropEncyclopedia() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(cropsData.map(c => c.category)))], []);

  const filteredCrops = cropsData.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(search.toLowerCase()) || 
                         crop.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRenderableSections = (crop: any) => {
    const excludedKeys = ['id', 'name', 'scientificName', 'localNames', 'image', 'category', 'season', 'sowingTime', 'harvestTime', 'duration', 'description'];
    return Object.entries(crop).filter(([key, value]) => {
      return !excludedKeys.includes(key) && value && (typeof value === 'object' || typeof value === 'string');
    });
  };

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* --- Aesthetic Page Header --- */}
      <div className="relative pt-24 pb-40 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-50 rounded-full blur-[180px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[150px] opacity-40 -translate-x-1/4 translate-y-1/4"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-8 lg:px-24">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
              <Gem size={14} /> National Crop Registry
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]">
              The Ultimate <br /><span className="text-green-600">Crop Intelligence</span>
            </h1>
            <p className="text-xl font-bold text-gray-400 max-w-2xl leading-relaxed">
              Unlock decades of agricultural research in a single dashboard. 
              Search for any crop to get professional-grade cultivation guides.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative group mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" size={28} />
                <input 
                  type="text" 
                  placeholder="Search for a crop..."
                  className="w-full pl-20 pr-10 py-8 bg-white rounded-[2.5rem] outline-none shadow-2xl shadow-gray-200 focus:shadow-green-100/50 transition-all font-black text-2xl text-gray-800 placeholder:text-gray-200 border border-gray-50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? "bg-green-600 text-white shadow-xl shadow-green-200" 
                        : "bg-white text-gray-400 hover:text-gray-900 hover:shadow-lg shadow-sm border border-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- Discovery Grid / Empty State --- */}
      <div className="mx-auto max-w-7xl px-8 lg:px-24 pb-48 -mt-16">
        {filteredCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredCrops.map((crop, idx) => (
              <div 
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 cursor-pointer border border-gray-100 flex flex-col"
              >
                <div className="relative h-72 w-full overflow-hidden">
                  <img src={crop.image} alt={crop.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-lg">
                      {crop.category}
                    </span>
                    <span className="px-4 py-2 bg-green-600/90 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                      {crop.season}
                    </span>
                  </div>
                </div>

                <div className="p-10 pb-12 flex flex-col flex-1">
                  <div className="mb-8">
                    <h3 className="text-4xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors tracking-tight">{crop.name}</h3>
                    <p className="text-xs font-bold text-gray-400 italic tracking-widest uppercase opacity-60">{crop.scientificName}</p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium line-clamp-4 mb-10 leading-relaxed flex-1">{crop.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                      Unlock Full Guide <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 bg-gray-50 rounded-[4rem] flex items-center justify-center text-gray-200 mb-10 border border-gray-100">
              <Search size={64} />
            </div>
            <h3 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-none">No Results Found</h3>
            <p className="text-xl font-bold text-gray-400 max-w-md mx-auto leading-relaxed">
              We couldn't find any intelligence profiles for <span className="text-gray-900">"{search}"</span>.
              Try adjusting your filters or searching for something else.
            </p>
            <button 
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-16 px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-2xl shadow-gray-400 active:scale-95"
            >
              Reset Discovery Filters
            </button>
          </div>
        )}
      </div>

      {/* --- Dashboard Modal Experience --- */}
      {selectedCrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-3xl" onClick={() => setSelectedCrop(null)}></div>
          
          <div className="relative bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[96vh] md:rounded-[4rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.7)] flex flex-col animate-in zoom-in-95 duration-700">
            
            <button 
              onClick={() => setSelectedCrop(null)}
              className="absolute top-8 right-8 z-50 p-5 bg-white/5 hover:bg-white text-white hover:text-gray-900 backdrop-blur-2xl rounded-full transition-all hover:rotate-90 active:scale-90"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
              
              {/* --- Cinematic Hero --- */}
              <div className="relative h-[450px] md:h-[600px] w-full shrink-0">
                <img src={selectedCrop.image} alt={selectedCrop.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                
                <div className="absolute bottom-16 left-12 md:left-24 right-12 md:right-24">
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="px-6 py-3 bg-green-600 text-white text-[12px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-3xl shadow-green-900/30">
                      {selectedCrop.category}
                    </div>
                    <div className="px-6 py-3 bg-white/90 backdrop-blur-md text-gray-900 text-[12px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-sm">
                      {selectedCrop.season}
                    </div>
                  </div>
                  <h2 className="text-7xl md:text-9xl font-black text-gray-900 mb-6 tracking-tighter leading-none">{selectedCrop.name}</h2>
                  <div className="flex flex-wrap items-center gap-6 text-gray-400 font-black tracking-widest text-sm uppercase opacity-60">
                    <span>{selectedCrop.scientificName}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>{selectedCrop.duration} Cycle</span>
                  </div>
                </div>
              </div>

              {/* --- Content Ecosystem --- */}
              <div className="px-12 md:px-24 py-24">
                <div className="max-w-5xl mx-auto space-y-32">
                  
                  {/* Executive Briefing */}
                  <div className="flex flex-col lg:flex-row gap-20 items-start">
                    <div className="lg:w-2/3">
                       <h4 className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                         <div className="w-12 h-[2px] bg-green-600"></div>
                         Project Overview
                       </h4>
                       <p className="text-3xl md:text-5xl font-black text-gray-900 leading-[1] tracking-tight">
                         {selectedCrop.description}
                       </p>
                    </div>
                    <div className="lg:w-1/3 w-full bg-gray-50 rounded-[3rem] p-12 space-y-10 border border-gray-100 shadow-inner">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-gray-100"><Clock size={28}/></div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Growth Period</p>
                            <p className="text-lg font-black text-gray-900">{selectedCrop.duration}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-gray-100"><MapPin size={28}/></div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Optimal Harvest</p>
                            <p className="text-lg font-black text-gray-900">{selectedCrop.harvestTime}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100"><Wind size={28}/></div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sowing Period</p>
                            <p className="text-lg font-black text-gray-900">{selectedCrop.sowingTime}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Intelligence Masonry Grid */}
                  <div className="space-y-12">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-4 justify-center">
                       <div className="w-12 h-[1px] bg-gray-100"></div>
                       Cultivation Intelligence
                       <div className="w-12 h-[1px] bg-gray-100"></div>
                    </h4>
                    
                    <div className="columns-1 md:columns-2 gap-8 space-y-8">
                      {getRenderableSections(selectedCrop)
                        .filter(([key]) => !['tips', 'faqs', 'schemes', 'governmentSchemes'].includes(key.toLowerCase()))
                        .map(([key, value]) => {
                        const theme = getSectionTheme(key);
                        return (
                          <div key={key} className={`break-inside-avoid rounded-[2.5rem] p-8 border ${theme.border} bg-white hover:shadow-xl transition-all duration-500 flex flex-col group`}>
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                              <div className={`w-12 h-12 ${theme.bg} ${theme.text} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm`}>
                                {theme.icon}
                              </div>
                              <h5 className="text-xl font-black text-gray-900 tracking-tight">{formatKey(key)}</h5>
                            </div>
                            
                            <div className="flex-1">
                              <DataRenderer value={value} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bonus Insights Section (Full Width Rows) */}
                  {getRenderableSections(selectedCrop).some(([key]) => ['tips', 'faqs', 'schemes', 'governmentSchemes'].includes(key.toLowerCase())) && (
                    <div className="space-y-12 pt-16 border-t border-gray-50">
                      <h4 className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] flex items-center gap-4 justify-center">
                        <div className="w-12 h-[1px] bg-green-100"></div>
                        Professional Support & Insights
                        <div className="w-12 h-[1px] bg-green-100"></div>
                      </h4>
                      <div className="space-y-10">
                        {getRenderableSections(selectedCrop)
                          .filter(([key]) => ['tips', 'faqs', 'schemes', 'governmentSchemes'].includes(key.toLowerCase()))
                          .map(([key, value]) => {
                            const theme = getSectionTheme(key);
                            return (
                              <div key={key} className={`w-full rounded-[3rem] p-10 md:p-16 border ${theme.border} bg-white hover:shadow-2xl transition-all duration-700 flex flex-col group`}>
                                <div className="flex items-center gap-6 mb-12 pb-10 border-b border-gray-100">
                                  <div className={`w-16 h-16 ${theme.bg} ${theme.text} rounded-[1.5rem] flex items-center justify-center shadow-sm transition-transform group-hover:rotate-12`}>
                                    {theme.icon}
                                  </div>
                                  <div>
                                    <h5 className="text-3xl font-black text-gray-900 tracking-tight">{formatKey(key)}</h5>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Strategic Farming Advice</p>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <DataRenderer value={value} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}


                  {/* Certification Block */}
                  <div className="pt-24 pb-20 border-t border-gray-50 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-600 mb-10 shadow-inner">
                      <ShieldCheck size={48} />
                    </div>
                    <h4 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Verified Agricultural Intelligence</h4>
                    <p className="text-lg font-bold text-gray-400 max-w-2xl mb-16 leading-relaxed">
                      Our system cross-references ICAR standards with regional farming practices. 
                      Data reflects optimal conditions—always adapt based on your specific micro-climate.
                    </p>
                    <button 
                      onClick={() => setSelectedCrop(null)}
                      className="group flex items-center gap-5 px-20 py-8 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-green-600 transition-all duration-700 shadow-3xl hover:shadow-green-900/40 active:scale-95"
                    >
                      Exit Intel Center <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes dropdown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
