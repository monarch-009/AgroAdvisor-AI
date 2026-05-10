"use client";

import { useState, useRef, useEffect } from "react";
import { predictCrop, predictCropByLocation, CropInput, LocationCropInput, CropResult } from "../../services/api";
import { 
  Sprout, Send, Trophy, CheckCircle, AlertTriangle, Thermometer, 
  Droplets, FlaskConical, CloudRain, Atom, TestTubes, Beaker,
  Search, RefreshCw, Activity, ArrowRight, MapPin, ChevronDown
} from "lucide-react";
import locationsRaw from "../../data/locations.json";

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
  const [activeTab, setActiveTab] = useState<"soil" | "location">("soil");
  
  const [form, setForm] = useState<CropInput>({
    N: 90, P: 42, K: 43,
    temperature: 20.8, humidity: 82, ph: 6.5, rainfall: 202.9,
  });

  const [locationForm, setLocationForm] = useState<LocationCropInput>({
    state: statesList[0], district: locationData[statesList[0]][0]
  });
  const [results, setResults] = useState<CropResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fields: { key: keyof CropInput; label: string; unit: string; min: number; max: number; icon: any; step?: number }[] = [
    { key: "N", label: "Nitrogen (N)", unit: "kg/ha", min: 0, max: 200, icon: FlaskConical },
    { key: "P", label: "Phosphorus (P)", unit: "kg/ha", min: 0, max: 200, icon: TestTubes },
    { key: "K", label: "Potassium (K)", unit: "kg/ha", min: 0, max: 300, icon: Beaker },
    { key: "temperature", label: "Temperature", unit: "°C", min: -10, max: 55, icon: Thermometer },
    { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, icon: Droplets },
    { key: "ph", label: "Soil pH", unit: "pH", min: 0, max: 14, icon: Atom, step: 0.1 },
    { key: "rainfall", label: "Rainfall", unit: "mm", min: 0, max: 600, icon: CloudRain },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      if (activeTab === "soil") {
        const res = await predictCrop(form);
        setResults(res.recommendations);
      } else {
        const res = await predictCropByLocation(locationForm);
        setResults(res.recommendations);
      }
    } catch (err: unknown) {
      setError("Analysis failed. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
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
              BY SOIL PROFILE
            </button>
            <button
              onClick={() => { setActiveTab("location"); setResults(null); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                activeTab === "location" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              BY LOCATION
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "soil" ? (
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
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-white transition-all group relative">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    <MapPin size={12} className="group-focus-within:text-green-600" />
                    State
                  </label>
                  <CustomSelect
                    value={locationForm.state}
                    options={statesList}
                    onChange={(newState) => {
                      setLocationForm({
                        state: newState,
                        district: locationData[newState][0] || ""
                      });
                    }}
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
                    onChange={(newDistrict) => {
                      setLocationForm({ ...locationForm, district: newDistrict });
                    }}
                  />
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
               <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Random Forest Processing...</p>
               <p className="text-xs text-gray-400 font-medium mt-2">Computing optimal growth probability across 22 crops</p>
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
                 <button className="flex items-center gap-2 text-xs font-black text-green-600 hover:gap-3 transition-all">
                    VIEW GROWTH GUIDE <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

