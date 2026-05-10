"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  IndianRupee,
  Leaf,
  Filter,
  Package,
  ArrowRight
} from "lucide-react";

const INDIAN_STATES = [
  "All States",
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal"
];

const DEMO_CROPS = [
  {
    _id: "c1",
    cropName: "Wheat",
    variety: "Sharbati",
    quantity: 50,
    unit: "Quintals",
    expectedPrice: 2400,
    isNegotiable: true,
    location: { state: "Madhya Pradesh", district: "Sehore" },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    viewCount: 45
  },
  {
    _id: "c2",
    cropName: "Rice",
    variety: "Basmati 1121",
    quantity: 120,
    unit: "Quintals",
    expectedPrice: 4200,
    isNegotiable: false,
    location: { state: "Punjab", district: "Amritsar" },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    viewCount: 112
  },
  {
    _id: "c3",
    cropName: "Tomato",
    variety: "Local Hybrid",
    quantity: 15,
    unit: "Tons",
    expectedPrice: 12000, // per ton
    isNegotiable: true,
    location: { state: "Maharashtra", district: "Nashik" },
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    viewCount: 38
  },
  {
    _id: "c4",
    cropName: "Onion",
    variety: "Red Onion",
    quantity: 80,
    unit: "Quintals",
    expectedPrice: 1800,
    isNegotiable: true,
    location: { state: "Maharashtra", district: "Pune" },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    viewCount: 65
  },
  {
    _id: "c5",
    cropName: "Soybean",
    variety: "JS 9560",
    quantity: 40,
    unit: "Quintals",
    expectedPrice: 4800,
    isNegotiable: false,
    location: { state: "Madhya Pradesh", district: "Indore" },
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    viewCount: 22
  },
  {
    _id: "c6",
    cropName: "Cotton",
    variety: "BT Cotton",
    quantity: 25,
    unit: "Quintals",
    expectedPrice: 7200,
    isNegotiable: true,
    location: { state: "Gujarat", district: "Rajkot" },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    viewCount: 89
  }
];

export default function CropMarketplace() {
  const [filters, setFilters] = useState({
    search: "",
    state: "All States",
  });

  const filteredCrops = useMemo(() => {
    return DEMO_CROPS.filter((item) => {
      if (filters.search && !item.cropName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.state !== "All States" && item.location.state !== filters.state) {
        return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" style={{ background: "linear-gradient(135deg, #f7fbf7 0%, #eef5ee 100%)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-green-50">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Crops from <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Farmers</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-xl">
              Buy fresh, high-quality agricultural produce directly from verified farmers across India. No middlemen.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search crops (e.g., Rice, Wheat, Tomato)..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-700"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em' }}
              >
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredCrops.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <Leaf className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Crops Found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => setFilters({ search: "", state: "All States" })}
              className="mt-6 text-green-600 font-semibold hover:text-green-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col hover:-translate-y-1 duration-300">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> {item.unit}
                        </span>
                        {item.isNegotiable && (
                          <span className="border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-xs font-semibold">
                            Negotiable
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 group-hover:text-green-600 transition-colors">
                        {item.cropName}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Variety: {item.variety || "Standard"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center text-sm font-medium">
                        <Package className="w-4 h-4 mr-2 text-slate-400" /> Quantity
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center text-sm font-medium">
                        <IndianRupee className="w-4 h-4 mr-2 text-slate-400" /> Price
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{item.expectedPrice.toLocaleString("en-IN")}
                        <span className="text-xs text-slate-400 font-normal ml-1">/{item.unit.slice(0,-1)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location.district}, {item.location.state}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    
                    <button className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white font-bold py-2.5 rounded-xl transition-colors border border-green-100 hover:border-transparent">
                      View Details <ArrowRight className="w-4 h-4" />
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
