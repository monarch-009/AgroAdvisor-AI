"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWeather, getMarketPrices, getPredictionHistory, getCropInfo,
  WeatherData, MarketPrice, CropInfo,
} from "../../services/api";
import {
  Cloud, Thermometer, Droplets, Wind, Search, RefreshCw,
  TrendingUp, TrendingDown, Bell, Clock,
  Droplet, ThermometerSun, Bug, Sprout, 
} from "lucide-react";

interface PredictionRecord {
  id: number;
  timestamp: string;
  recommended_crop: string;
  confidence: number;
  inputs: { N: number; P: number; K: number; temperature: number; humidity: number; ph: number; rainfall: number };
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [city, setCity] = useState("Jalandhar");
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchWeather = useCallback(async (searchCity?: string) => {
    setLoadingWeather(true);
    try {
      const data = await getWeather(searchCity || city);
      setWeather(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      console.error("Weather fetch failed");
    } finally {
      setLoadingWeather(false);
    }
  }, [city]);

  const fetchPrices = async () => {
    setLoadingPrices(true);
    try {
      const data = await getMarketPrices();
      setPrices(data);
    } catch {
      setPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getPredictionHistory(5);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchPrices();
    fetchHistory();
    const interval = setInterval(() => fetchWeather(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const advisories = [
    { icon: Droplet, title: "Irrigation Advisory", text: "Optimal humidity detected. Water savings possible for drought-resistant crops.", time: "2h ago", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: ThermometerSun, title: "Heat Alert", text: "High temperatures expected. Consider early morning irrigation for moisture retention.", time: "5h ago", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Bug, title: "Pest Warning", text: "Localized reports of aphid activity. Monitor fields for early detection.", time: "1d ago", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-12 py-10">
      
      {/* Page Header */}
      <div className="mb-10 animate-in">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2 text-center sm:text-left">Dashboard</h1>
        <p className="text-gray-500 font-medium text-center sm:text-left">Real-time agricultural insights and market intelligence</p>
      </div>

      {/* Weather Section */}
      <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 mb-8 shadow-xl shadow-gray-200/40 animate-in delay-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Cloud size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Conditions</p>
              <h2 className="text-xl font-extrabold text-gray-900">Weather Forecast</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input 
                 className="bg-gray-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl pl-9 pr-4 py-2 text-sm font-bold transition-all outline-none w-48"
                 value={city} onChange={(e) => setCity(e.target.value)} placeholder="Search city..."
               />
             </div>
             <button onClick={() => fetchWeather()} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
               <RefreshCw size={18} />
             </button>
          </div>
        </div>

        {loadingWeather ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : weather ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Thermometer, val: `${weather.temperature}°C`, label: "Temp", color: "text-rose-600", bg: "bg-rose-50" },
              { icon: Droplets, val: `${weather.humidity}%`, label: "Humidity", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Wind, val: `${weather.wind_speed}m/s`, label: "Wind", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Cloud, val: weather.description, label: weather.city, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-50 rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon size={20} />
                </div>
                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{item.val}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Market Prices */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Live Market Prices</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Crop</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                  <th className="pb-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {prices.map((p) => (
                  <tr key={p.crop} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{p.crop}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.market}</div>
                    </td>
                    <td className="py-4 text-center font-black text-gray-900">₹{p.price_per_quintal.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${
                        p.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {p.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {p.change}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advisories */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/40 animate-in delay-3">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <Bell size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Smart Advisories</h3>
          </div>

          <div className="space-y-4">
            {advisories.map((adv, i) => (
              <div key={i} className="group p-5 bg-gray-50 border-2 border-transparent hover:border-green-600 hover:bg-white rounded-2xl transition-all cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 ${adv.bg} ${adv.color} rounded-lg flex items-center justify-center`}>
                    <adv.icon size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{adv.time}</span>
                </div>
                <h4 className="font-black text-sm text-gray-900 mb-1">{adv.title}</h4>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">{adv.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="mt-8 bg-gray-900 rounded-3xl p-8 text-white animate-in delay-4">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="text-xl font-extrabold">Recent Predictions</h3>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Date</th>
                  <th className="pb-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Recommended</th>
                  <th className="pb-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Confidence</th>
                  <th className="pb-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-right text-green-400">Nutrients (N/P/K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-xs font-bold text-white/60">{new Date(h.timestamp).toLocaleDateString()}</td>
                    <td className="py-4 font-black text-white capitalize">{h.recommended_crop}</td>
                    <td className="py-4 text-center">
                       <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs font-black">
                         {(h.confidence * 100).toFixed(0)}%
                       </span>
                    </td>
                    <td className="py-4 text-right font-mono text-sm text-green-400">
                      {h.inputs.N}/{h.inputs.P}/{h.inputs.K}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
