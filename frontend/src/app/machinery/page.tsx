"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Gauge,
  Eye,
  Tractor,
  Settings,
  ShieldCheck,
  Tag
} from "lucide-react";

const CATEGORIES = [
  { value: "tractor", label: "Tractors" },
  { value: "harvester", label: "Harvesters" },
  { value: "plough", label: "Ploughs" },
  { value: "sprayer", label: "Sprayers" },
  { value: "rotavator", label: "Rotavators" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "excellent", label: "Excellent", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "good", label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "fair", label: "Fair", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const DEMO_MACHINERY = [
  {
    _id: "m1",
    title: "Mahindra 575 DI XP Plus",
    brand: "Mahindra",
    model: "575 DI",
    category: "tractor",
    price: 450000,
    priceNegotiable: true,
    condition: "excellent",
    year: 2021,
    location: { state: "Punjab", district: "Ludhiana" },
    views: 124,
    hoursUsed: "1200 hrs"
  },
  {
    _id: "m2",
    title: "Swaraj 744 FE",
    brand: "Swaraj",
    model: "744 FE",
    category: "tractor",
    price: 380000,
    priceNegotiable: false,
    condition: "good",
    year: 2019,
    location: { state: "Haryana", district: "Karnal" },
    views: 89,
    hoursUsed: "2500 hrs"
  },
  {
    _id: "m3",
    title: "Shaktiman Rotavator 6 Feet",
    brand: "Shaktiman",
    model: "Regular Light",
    category: "rotavator",
    price: 85000,
    priceNegotiable: true,
    condition: "excellent",
    year: 2022,
    location: { state: "Maharashtra", district: "Pune" },
    views: 45,
    hoursUsed: "300 hrs"
  },
  {
    _id: "m4",
    title: "John Deere 5310",
    brand: "John Deere",
    model: "5310",
    category: "tractor",
    price: 620000,
    priceNegotiable: true,
    condition: "good",
    year: 2020,
    location: { state: "Uttar Pradesh", district: "Agra" },
    views: 210,
    hoursUsed: "1800 hrs"
  },
  {
    _id: "m5",
    title: "Aspee Knapsack Sprayer",
    brand: "Aspee",
    model: "Battery Operated",
    category: "sprayer",
    price: 4500,
    priceNegotiable: false,
    condition: "fair",
    year: 2021,
    location: { state: "Madhya Pradesh", district: "Indore" },
    views: 32,
    hoursUsed: "N/A"
  },
  {
    _id: "m6",
    title: "Kartar 4000 Harvester",
    brand: "Kartar",
    model: "4000",
    category: "harvester",
    price: 1850000,
    priceNegotiable: true,
    condition: "good",
    year: 2018,
    location: { state: "Punjab", district: "Amritsar" },
    views: 350,
    hoursUsed: "3500 hrs"
  }
];

export default function MachineryMarketplace() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    condition: "",
  });

  const filteredMachinery = useMemo(() => {
    return DEMO_MACHINERY.filter((item) => {
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase()) && !item.brand.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      if (filters.condition && item.condition !== filters.condition) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const getConditionStyle = (conditionValue: string) => {
    const cond = CONDITIONS.find(c => c.value === conditionValue);
    return cond ? cond.color : "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getConditionLabel = (conditionValue: string) => {
    return CONDITIONS.find(c => c.value === conditionValue)?.label || conditionValue;
  };

  const getCategoryLabel = (catValue: string) => {
    return CATEGORIES.find(c => c.value === catValue)?.label || catValue;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f1f5f9 100%)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-emerald-50">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
              <Tractor className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Machinery <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Marketplace</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-xl">
              Buy and sell pre-owned agricultural equipment. Connect directly with sellers and save on farming investments.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
               <ShieldCheck className="w-12 h-12 text-emerald-500" />
               <div>
                 <h4 className="font-bold text-slate-800">Trusted Network</h4>
                 <p className="text-sm text-slate-500">Verified buyers & sellers</p>
               </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tractors, harvesters, brands..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer w-full sm:w-auto"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <select
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer w-full sm:w-auto"
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="">All Conditions</option>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredMachinery.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <Tractor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Equipment Found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => setFilters({ search: "", category: "", condition: "" })}
              className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredMachinery.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col hover:-translate-y-1 duration-300">
                
                {/* Image Placeholder */}
                <div className="h-56 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                   <Tractor className="w-20 h-20 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200/50">
                       {getCategoryLabel(item.category)}
                     </span>
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.brand} • {item.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getConditionStyle(item.condition)}`}>
                      {getConditionLabel(item.condition)}
                    </span>
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <Settings className="w-3 h-3" /> {item.hoursUsed}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1 font-medium">Asking Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-800">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {item.priceNegotiable && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                            <Tag className="w-3 h-3" /> Negotiable
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {item.location.district}, {item.location.state}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {item.year}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Eye className="w-4 h-4 text-slate-400" />
                        {item.views}
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold py-3 rounded-xl transition-colors border border-emerald-100 hover:border-transparent">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
