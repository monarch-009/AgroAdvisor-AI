"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  RefreshCw, 
  Wheat, 
  Info,
  Search
} from "lucide-react";

// Demo fallback data while waiting for real API
const DEMO_PRICES = [
  { _id: "demo1", cropName: "Wheat", variety: "Sharbati", state: "Punjab", district: "Ludhiana", mandiName: "Ludhiana Mandi", priceMin: 2100, priceMax: 2350, priceModal: 2225, date: new Date().toISOString() },
  { _id: "demo2", cropName: "Rice", variety: "Basmati", state: "Haryana", district: "Karnal", mandiName: "Karnal Mandi", priceMin: 2800, priceMax: 3100, priceModal: 2950, date: new Date().toISOString() },
  { _id: "demo3", cropName: "Tomato", variety: "Local", state: "Maharashtra", district: "Pune", mandiName: "Pune APMC", priceMin: 900, priceMax: 1400, priceModal: 1150, date: new Date().toISOString() },
  { _id: "demo4", cropName: "Onion", variety: "Red", state: "Maharashtra", district: "Nashik", mandiName: "Lasalgaon Mandi", priceMin: 1200, priceMax: 1800, priceModal: 1500, date: new Date().toISOString() },
  { _id: "demo5", cropName: "Potato", variety: "Jyoti", state: "Uttar Pradesh", district: "Agra", mandiName: "Agra Mandi", priceMin: 800, priceMax: 1100, priceModal: 950, date: new Date().toISOString() },
  { _id: "demo6", cropName: "Soybean", variety: "Yellow", state: "Madhya Pradesh", district: "Indore", mandiName: "Indore Mandi", priceMin: 4200, priceMax: 4600, priceModal: 4400, date: new Date().toISOString() },
  { _id: "demo7", cropName: "Cotton", variety: "DCH-32", state: "Gujarat", district: "Rajkot", mandiName: "Rajkot Mandi", priceMin: 6500, priceMax: 7200, priceModal: 6850, date: new Date().toISOString() },
  { _id: "demo8", cropName: "Maize", variety: "Hybrid", state: "Karnataka", district: "Davangere", mandiName: "Davangere Mandi", priceMin: 1800, priceMax: 2100, priceModal: 1950, date: new Date().toISOString() },
];

const DEMO_CROPS = ["Wheat", "Rice", "Tomato", "Onion", "Potato", "Soybean", "Cotton", "Maize"];
const DEMO_STATES = ["Punjab", "Haryana", "Maharashtra", "Uttar Pradesh", "Madhya Pradesh", "Gujarat", "Karnataka"];

export default function MarketPrices() {
  const [filters, setFilters] = useState({ crop: "", state: "" });
  const [prices, setPrices] = useState(DEMO_PRICES);
  const [isLoading, setIsLoading] = useState(false);

  // In the future, this will fetch from the real API provided by the user
  const fetchPrices = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // For now, filter the demo data
      let filteredPrices = [...DEMO_PRICES];
      if (filters.crop) {
        filteredPrices = filteredPrices.filter(p => p.cropName === filters.crop);
      }
      if (filters.state) {
        filteredPrices = filteredPrices.filter(p => p.state === filters.state);
      }
      
      setPrices(filteredPrices);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const latestDate = prices.length > 0 ? new Date(prices[0].date) : new Date();

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
            Track real-time agricultural commodity prices across Indian markets to make informed selling decisions.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {latestDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* Demo Mode Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-amber-800 font-semibold text-sm">Demo Mode Active</h3>
            <p className="text-amber-700 text-sm mt-1">
              Currently showing offline demonstration data. The application is ready to be integrated with the real Indian Market Watcher API.
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Crop Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-green-600" /> Crop Type
              </label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={filters.crop}
                  onChange={(e) => setFilters(prev => ({ ...prev, crop: e.target.value }))}
                >
                  <option value="">All Crops</option>
                  {DEMO_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> State
              </label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                >
                  <option value="">All States</option>
                  {DEMO_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex gap-2 h-[50px]">
                <button 
                  onClick={() => fetchPrices()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {(filters.crop || filters.state) && (
                  <button 
                    onClick={() => setFilters({ crop: "", state: "" })}
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-4" />
              <p>Fetching latest market prices...</p>
            </div>
          ) : prices.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Prices Found</h3>
              <p className="text-slate-500 max-w-md">We couldn't find any market prices matching your current filters. Try selecting different options.</p>
              <button 
                onClick={() => setFilters({ crop: "", state: "" })}
                className="mt-6 text-green-600 font-semibold hover:text-green-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Crop Info</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Market Location</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Min Price</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Max Price</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Modal Price (₹/Qt)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prices.map((price, idx) => (
                    <tr key={price._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{price.cropName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{price.variety || "Standard"} Variety</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {price.mandiName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 ml-5">{price.district}, {price.state}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-600">
                        ₹{price.priceMin.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-600">
                        ₹{price.priceMax.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold">
                          ₹{price.priceModal.toLocaleString("en-IN")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-slate-400 pb-8">
          Prices are quoted in ₹ per Quintal (100 kg). Data is subject to market fluctuations.
        </div>

      </div>
    </div>
  );
}
