"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  History, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Leaf, 
  Search, 
  ChevronRight, 
  ArrowUpRight,
  Clock,
  Activity,
  Sparkles,
  PieChart,
  Globe
} from "lucide-react";
import { getDashboardSummary, DashboardStats } from "../../services/api";

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${color.replace('bg-', 'bg-').replace('-50', '-50')} flex items-center justify-center text-gray-900 group-hover:rotate-6 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    <h3 className="text-4xl font-black text-gray-900 relative z-10 tracking-tight">{value}</h3>
  </div>
);

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchStats();
    }
  }, [isLoaded, user]);

  const fetchStats = async () => {
    try {
      const data = await getDashboardSummary(user?.id || "guest");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Plus_Jakarta_Sans'] pb-24">
      {/* Hero Header */}
      <div className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-green-50/50 via-white to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5" /> Farmer Intelligence
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[0.95]">
                Welcome back, <span className="text-green-600">{user?.firstName || 'Farmer'}</span>
              </h1>
              <p className="text-gray-500 font-medium text-lg max-w-xl">
                Your personalized agricultural hub. Track search patterns, soil health trends, and regional crop performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-10">
        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Analyses" 
            value={stats?.total_searches || 0} 
            icon={Activity} 
            color="bg-blue-50" 
          />
          <StatCard 
            title="Crop Diversity" 
            value={stats?.diversity_score || 0} 
            icon={PieChart} 
            color="bg-purple-50" 
          />
          <StatCard 
            title="Active Regions" 
            value={stats?.top_locations?.length || 0} 
            icon={MapPin} 
            color="bg-rose-50" 
          />
          <StatCard 
            title="Last Activity" 
            value={stats?.last_search ? new Date(stats.last_search).toLocaleDateString() : 'Never'} 
            icon={Clock} 
            color="bg-amber-50" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent History List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <History className="w-6 h-6 text-green-600" /> Recent Activity Log
              </h2>
            </div>

            <div className="space-y-4">
              {stats?.recent_history && stats.recent_history.length > 0 ? (
                stats.recent_history.map((entry: any, i: number) => {
                  const isRegional = entry.query.type === 'regional_analysis';
                  return (
                    <div 
                      key={i} 
                      className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 hover:border-green-100 hover:shadow-xl hover:shadow-green-900/5 transition-all flex items-center gap-6"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isRegional ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {isRegional ? <Globe className="w-7 h-7" /> : <Leaf className="w-7 h-7" />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {isRegional ? 'Regional Intelligence' : 'Soil Health Analysis'}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 group-hover:text-green-600 transition-colors">
                          {isRegional ? `${entry.query.district}, ${entry.query.state}` : `Soil pH ${entry.query.ph} analysis`}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-gray-500">Top Result:</p>
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-700 text-[10px] font-black uppercase rounded-md border border-gray-100 capitalize">
                            {typeof entry.results[0] === 'string' ? entry.results[0] : entry.results[0].crop}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-sm">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-gray-400 font-bold">No recent history found. Start your first analysis!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Advanced Analytics */}
          <div className="space-y-8">
            {/* Top Recommended Crops */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 rounded-full blur-[60px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-black tracking-tight">Top Performance</h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">
                    Most frequently recommended crops for your land profiles:
                  </p>
                  <div className="space-y-4">
                    {stats?.most_recommended && stats.most_recommended.length > 0 ? (
                      stats.most_recommended.map((crop, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group/item">
                          <span className="font-black text-sm capitalize">{crop}</span>
                          <ArrowUpRight className="w-4 h-4 text-green-400 group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-transform" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">Analyze more fields to see trends</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Regions */}
            <div className="bg-green-50 border border-green-100 rounded-[3rem] p-10 space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Monitored Regions</h3>
              <div className="space-y-3">
                {stats?.top_locations && stats.top_locations.length > 0 ? (
                  stats.top_locations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <ChevronRight className="w-4 h-4 text-green-500" />
                      {loc}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm font-medium italic">No regional data yet</p>
                )}
              </div>
            </div>

            {/* Diversity Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-[3rem] p-10 space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Crop Diversity</h3>
              <p className="text-gray-600 text-sm font-medium leading-relaxed">
                You have explored <span className="text-blue-700 font-black">{stats?.diversity_score || 0}</span> unique crop varieties across your lands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
