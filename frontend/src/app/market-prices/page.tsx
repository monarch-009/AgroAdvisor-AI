"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  RefreshCw, 
  Wheat, 
  Info,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";

// The API endpoint and key
const API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = "579b464db66ec23bdd0000016da1958d1496401941d282a546a0d973";

// All Indian States and UTs that currently have Mandi data on Data.gov.in
const STATES = [
  "Andhra Pradesh", "Assam", "Chandigarh", "Chattisgarh", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jammu and Kashmir", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "NCT of Delhi", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface PriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export default function MarketPrices() {
  const [filters, setFilters] = useState({ commodity: "", state: "" });
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Dropdown State
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  
  // Pagination State
  const [offset, setOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 100;

  const fetchPrices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${API_URL}?api-key=${API_KEY}&format=json&limit=${LIMIT}&offset=${offset}`;
      if (filters.commodity) {
        url += `&filters[commodity]=${encodeURIComponent(filters.commodity)}`;
      }
      if (filters.state) {
        url += `&filters[state]=${encodeURIComponent(filters.state)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch market data");
      const data = await res.json();
      
      if (data.records) {
        setPrices(data.records);
        setTotalRecords(data.total || 0);
      } else {
        setPrices([]);
        setTotalRecords(0);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.commodity, filters.state, offset]);

  const latestDate = prices.length > 0 && prices[0].arrival_date 
    ? prices[0].arrival_date 
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, '/');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" style={{ background: "linear-gradient(135deg, #f6f9f6 0%, #eef5ee 100%)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-2">
            <IndianRupee className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Mandi Prices</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Track real-time agricultural commodity prices across Indian markets powered by Data.gov.in
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 inline-flex mx-auto">
            <Calendar className="w-4 h-4 text-green-600" />
            <span>Latest Update: {latestDate}</span>
          </div>
        </div>

        {/* Live Data Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="relative flex h-3 w-3 mt-1.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-emerald-800 font-semibold text-sm">Live Government Data Active</h3>
            <p className="text-emerald-700 text-sm mt-1">
              Currently showing live market data fetched securely from the Government of India's Open Data Platform.
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Commodity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-green-600" /> Search Commodity
              </label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. Wheat, Tomato, Onion..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={filters.commodity}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, commodity: e.target.value }));
                    setOffset(0);
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Filter by State
              </label>
              <div className="relative">
                <div 
                  onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors select-none"
                >
                  <span className={filters.state ? "text-slate-800 font-medium" : "text-slate-400"}>
                    {filters.state || "All States"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isStateDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsStateDropdownOpen(false)} 
                    />
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-blue-900/5 max-h-64 overflow-y-auto">
                      <div 
                        onClick={() => { setFilters(prev => ({...prev, state: ""})); setOffset(0); setIsStateDropdownOpen(false); }}
                        className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center ${!filters.state ? 'bg-blue-50/50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-slate-600 border-l-4 border-transparent'}`}
                      >
                        All States
                      </div>
                      {STATES.map(s => (
                        <div 
                          key={s}
                          onClick={() => { setFilters(prev => ({...prev, state: s})); setOffset(0); setIsStateDropdownOpen(false); }}
                          className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center ${filters.state === s ? 'bg-blue-50/50 text-blue-700 font-bold border-l-4 border-blue-600' : 'text-slate-600 border-l-4 border-transparent'}`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex gap-2 h-[50px]">
                <button 
                  onClick={() => { setOffset(0); fetchPrices(); }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-green-600/20"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {(filters.commodity || filters.state) && (
                  <button 
                    onClick={() => { setFilters({ commodity: "", state: "" }); setOffset(0); }}
                    className="flex-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
          {error ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 flex-1">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Error Loading Data</h3>
              <p className="text-slate-500 text-center max-w-md">{error}</p>
              <button onClick={() => fetchPrices()} className="mt-4 text-green-600 font-bold hover:underline">Try Again</button>
            </div>
          ) : isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 flex-1">
              <RefreshCw className="w-10 h-10 animate-spin text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Fetching Live Data</h3>
              <p className="font-medium text-slate-600 text-center max-w-md">Connecting to Government databases to fetch the latest market prices...</p>
              <p className="text-sm text-slate-400 mt-3 text-center bg-slate-100 px-4 py-2 rounded-lg">Please note: The Data.gov.in API can sometimes take 10-30 seconds to respond under heavy load.</p>
            </div>
          ) : prices.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center flex-1">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Prices Found</h3>
              <p className="text-slate-500 max-w-md">We couldn't find any recent market prices matching your current filters. Try selecting different options.</p>
              <button 
                onClick={() => { setFilters({ commodity: "", state: "" }); setOffset(0); }}
                className="mt-6 text-green-600 font-semibold hover:text-green-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Commodity</th>
                      <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Market Location</th>
                      <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Min Price</th>
                      <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Max Price</th>
                      <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Modal Price (₹/Qt)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prices.map((price, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{price.commodity}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">Var: {price.variety} • Grade: {price.grade}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {price.market}
                          </div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5 ml-5">{price.district}, {price.state}</div>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-slate-600">
                          ₹{Number(price.min_price).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-slate-600">
                          ₹{Number(price.max_price).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200/60 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            ₹{Number(price.modal_price).toLocaleString("en-IN")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="bg-slate-50/50 border-t border-slate-100 p-4 px-6 flex items-center justify-between mt-auto">
                <div className="text-sm font-medium text-slate-500">
                  Showing {offset + 1} to {Math.min(offset + LIMIT, totalRecords)} of {totalRecords} records
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                    disabled={offset === 0 || isLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button 
                    onClick={() => setOffset(offset + LIMIT)}
                    disabled={offset + LIMIT >= totalRecords || isLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="text-center text-sm font-medium text-slate-400 pb-8 flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          Prices are quoted in ₹ per Quintal (100 kg). Data sourced directly from Agmarknet portal via data.gov.in.
        </div>

      </div>
    </div>
  );
}
