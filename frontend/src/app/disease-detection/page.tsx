"use client";

import { useState, useRef, useCallback } from "react";
import { detectDisease, DiseaseResponse } from "../../services/api";
import {
  Upload, Shield, ShieldAlert, AlertTriangle, ImageIcon,
  Activity, Pill, Bug, Leaf, Microscope, Sprout, X, 
  FlaskConical, CheckCircle, BookOpen, ShieldCheck, Apple, MapPin, Search
} from "lucide-react";

export default function DiseaseDetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<DiseaseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await detectDisease(file);
      setResult(res);
    } catch (err: unknown) {
      setError("AI analysis failed. Please verify the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12">
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="mb-12 animate-in text-center sm:text-left">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Disease Detection</h1>
        <p className="text-gray-500 font-medium">Identify plant health issues instantly with high-accuracy AI vision analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ── Left Column: Upload ────────────────────────────────── */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Step 01</p>
              <h2 className="text-xl font-extrabold text-gray-900">Upload Leaf Image</h2>
            </div>
          </div>

          <div
            className={`relative group h-72 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              dragOver ? "border-green-600 bg-green-50/50" : "border-gray-200 bg-gray-50/30 hover:border-green-400 hover:bg-gray-50/80"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="w-full h-full relative">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <p className="text-white text-sm font-black uppercase tracking-widest">Click to Replace</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-4 mx-auto group-hover:text-green-600 transition-colors">
                  <ImageIcon size={32} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Drag image here</p>
                <p className="text-xs text-gray-400 font-medium">PNG, JPEG or WebP up to 10MB</p>
              </div>
            )}
          </div>

          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div className="flex gap-4 mt-8">
            <button 
              className="flex-1 bg-gray-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200 active:scale-[0.98]"
              onClick={handleSubmit} disabled={!file || loading}
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Microscope size={18} />
              )}
              {loading ? "Analyzing..." : "Detect Disease"}
            </button>
            {result && (
              <button className="px-5 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors" onClick={resetAnalysis}>
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>

        {/* ── Right Column: Diagnosis ────────────────────────────── */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-2 min-h-[500px]">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Sprout size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Step 02</p>
              <h2 className="text-xl font-extrabold text-gray-900">AI Diagnosis</h2>
            </div>
          </div>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                <Search size={32} />
              </div>
              <p className="text-sm font-bold text-gray-300">Awaiting image upload to begin analysis</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
               <div className="w-20 h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-6" />
               <p className="text-sm font-black text-gray-900 uppercase tracking-widest">MobileNetV2 Scanning...</p>
               <p className="text-xs text-gray-400 font-medium mt-2">Checking pattern signatures against 38 plant classes</p>
            </div>
          )}

          {result && (
            <div className="animate-in space-y-6">
              <div className={`p-5 rounded-2xl flex items-center gap-4 border-2 ${
                result.is_healthy ? 'bg-green-50 border-green-100 text-green-700' : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                {result.is_healthy ? <Shield size={24} /> : <ShieldAlert size={24} />}
                <span className="font-black text-lg">{result.is_healthy ? "Health Confirmed" : "Pathogen Detected"}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-transparent">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Classification</p>
                 <h3 className="text-2xl font-black text-gray-900">{result.disease}</h3>
                 <div className="flex items-center gap-2 mt-4">
                    <Activity size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Confidence:</span>
                    <span className={`text-sm font-black ${result.confidence > 0.8 ? 'text-green-600' : 'text-amber-600'}`}>
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                 </div>
                 <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: `${result.confidence * 100}%` }} />
                 </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Pill size={18} className="text-blue-600" />
                  <p className="text-sm font-black text-blue-900 uppercase tracking-widest">Recommended Treatment</p>
                </div>
                <p className="text-sm font-medium text-blue-800/80 leading-relaxed">
                  {result.treatment}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Lower Section: Detailed Intelligence ────────────────── */}
      {result?.detail && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in delay-3">
           <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <BookOpen size={20} />
               </div>
               <h4 className="text-lg font-black text-gray-900">Analysis</h4>
             </div>
             <p className="text-sm font-medium text-gray-500 leading-relaxed">{result.detail.description}</p>
           </div>

           <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                 <Bug size={20} />
               </div>
               <h4 className="text-lg font-black text-gray-900">Causes</h4>
             </div>
             <ul className="space-y-3">
               {result.detail.causes.map((c, i) => (
                 <li key={i} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0" /> {c}
                 </li>
               ))}
             </ul>
           </div>

           <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                 <ShieldCheck size={20} />
               </div>
               <h4 className="text-lg font-black text-gray-900">Prevention</h4>
             </div>
             <ul className="space-y-3">
               {result.detail.prevention.map((p, i) => (
                 <li key={i} className="flex items-start gap-2 text-xs font-bold text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" /> {p}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      )}

    </div>
  );
}

function RefreshCw({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
}
