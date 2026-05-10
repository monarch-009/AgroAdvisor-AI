"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Eye,
  IndianRupee,
  Leaf,
  FlaskConical,
  Filter,
  Package,
  ShoppingBag,
  ArrowRight
} from "lucide-react";

const INDIAN_STATES = [
  "All States",
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal"
];

const DEMO_PRODUCTS = [
  {
    _id: "p1",
    name: "Mahyco BT Cotton Seeds (Bollgard II)",
    brand: "Mahyco",
    type: "seed",
    category: "Cotton",
    price: 850,
    mrp: 950,
    unit: "Packet (450g)",
    stock: 120,
    location: { state: "Maharashtra", district: "Jalna" },
    viewCount: 345
  },
  {
    _id: "p2",
    name: "IFFCO Nano Urea Liquid Fertilizer",
    brand: "IFFCO",
    type: "fertilizer",
    category: "Nitrogen",
    price: 240,
    mrp: 240,
    unit: "Bottle (500ml)",
    stock: 500,
    location: { state: "Gujarat", district: "Kandla" },
    viewCount: 890
  },
  {
    _id: "p3",
    name: "Pioneer 3302 Hybrid Maize Seeds",
    brand: "Pioneer",
    type: "seed",
    category: "Maize",
    price: 1200,
    mrp: 1400,
    unit: "Bag (4kg)",
    stock: 45,
    location: { state: "Karnataka", district: "Hubli" },
    viewCount: 156
  },
  {
    _id: "p4",
    name: "Coromandel Gromor 10:26:26 NPK",
    brand: "Coromandel",
    type: "fertilizer",
    category: "Complex NPK",
    price: 1450,
    mrp: 1550,
    unit: "Bag (50kg)",
    stock: 200,
    location: { state: "Andhra Pradesh", district: "Visakhapatnam" },
    viewCount: 420
  },
  {
    _id: "p5",
    name: "Advanta Golden Seeds - Mustard",
    brand: "Advanta",
    type: "seed",
    category: "Mustard",
    price: 350,
    mrp: 400,
    unit: "Packet (1kg)",
    stock: 0,
    location: { state: "Rajasthan", district: "Bharatpur" },
    viewCount: 89
  },
  {
    _id: "p6",
    name: "YaraMila Complex (21-7-14)",
    brand: "Yara",
    type: "fertilizer",
    category: "Premium NPK",
    price: 2800,
    mrp: 3000,
    unit: "Bag (25kg)",
    stock: 30,
    location: { state: "Maharashtra", district: "Pune" },
    viewCount: 215
  }
];

export default function ProductMarketplace() {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    state: "All States",
  });

  const filteredProducts = useMemo(() => {
    return DEMO_PRODUCTS.filter((item) => {
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) && !item.brand.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type !== "all" && item.type !== filters.type) {
        return false;
      }
      if (filters.state !== "All States" && item.location.state !== filters.state) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const getTypeBadge = (type: string) => {
    if (type === "seed") {
      return (
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
          <Leaf className="w-3 h-3" /> Seed
        </span>
      );
    }
    return (
      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
        <FlaskConical className="w-3 h-3" /> Fertilizer
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f1f5f9 100%)" }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-emerald-50">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Seed & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Fertilizer</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-xl">
              Quality agricultural inputs from trusted brands and verified sellers to boost your farm's yield.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search seeds, fertilizers, brands..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="flex gap-4">
            <select
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="all">All Types</option>
              <option value="seed">Seeds</option>
              <option value="fertilizer">Fertilizers</option>
            </select>

            <select
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em' }}
            >
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Products Found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => setFilters({ search: "", type: "all", state: "All States" })}
              className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col hover:-translate-y-1 duration-300">
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(item.type)}
                      {item.stock === 0 && (
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-3">
                    {item.brand}
                  </p>

                  <div className="inline-block border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold mb-4 w-max">
                    {item.category}
                  </div>

                  <div className="flex items-end justify-between mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-emerald-600">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ {item.unit}</span>
                      </div>
                      {item.mrp > item.price && (
                        <div className="text-xs text-slate-400 line-through mt-0.5">
                          MRP: ₹{item.mrp.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center text-xs text-slate-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {item.location.district}, {item.location.state}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {item.viewCount} views
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {item.stock} in stock
                      </span>
                    </div>
                    
                    <button 
                      disabled={item.stock === 0}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl transition-colors border ${item.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-100 hover:border-transparent'}`}
                    >
                      Buy Now <ArrowRight className="w-4 h-4" />
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
