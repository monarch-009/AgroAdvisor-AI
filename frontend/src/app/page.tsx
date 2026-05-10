"use client";

import Link from "next/link";
import {
  ArrowRight, Sprout, Search, BarChart3,
  Target, Microscope, Zap, ChevronRight, Leaf,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Sprout,
      title: "Smart Crop Recommendation",
      desc: "AI-powered recommendations based on soil nutrient levels, climate conditions, and pH. Optimize yield with data-driven decisions.",
      href: "/crop-recommendation",
      color: "#2e8b3c",
      bgColor: "#f0fdf4",
    },
    {
      icon: Microscope,
      title: "Disease Detection",
      desc: "Upload a photograph of a plant leaf and instantly identify diseases using a convolutional neural network trained on agricultural data.",
      href: "/disease-detection",
      color: "#2563a8",
      bgColor: "#eff6ff",
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      desc: "Access real-time weather forecasts and crop market prices. Make informed agricultural decisions backed by live data.",
      href: "/dashboard",
      color: "#b45309",
      bgColor: "#fffbeb",
    },
  ];

  return (
    <div className="bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-[10%] opacity-[0.03] rotate-12">
          <Leaf size={400} className="text-green-900" strokeWidth={0.5} />
        </div>
        <div className="absolute -bottom-20 left-[5%] opacity-[0.02] -rotate-12">
          <Leaf size={350} className="text-green-900" strokeWidth={0.5} />
        </div>

        <div className="max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-8 animate-in">
             <Zap size={14} className="text-green-600" />
             <span className="text-xs font-black text-green-700 uppercase tracking-widest">Powered by Advanced ML</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.05] mb-8 animate-in delay-1">
            AI-Powered Crop <br />
            <span className="text-green-600">Advisory System</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12 animate-in delay-2">
            Intelligent crop recommendations, instant plant disease detection,
            and real-time market data — built for the future of precision agriculture.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-in delay-3">
            <Link href="/crop-recommendation">
              <button className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-95 flex items-center gap-3">
                <Sprout size={20} />
                Get Crop Advice
              </button>
            </Link>
            <Link href="/disease-detection">
              <button className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-gray-100/50">
                <Search size={20} />
                Detect Disease
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-in">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] mb-4">Core Intelligence</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href} className="group">
                  <div className={`h-full bg-white border-2 border-gray-100 p-10 rounded-[32px] shadow-xl shadow-gray-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60 hover:-translate-y-1 animate-in delay-${i+1}`}>
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <Icon size={24} style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm">
                      {feature.desc}
                    </p>
                    <div 
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-3"
                      style={{ color: feature.color }}
                    >
                      Explore Feature <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-green-600/20">A</div>
             <span className="font-black tracking-tight text-gray-900">AgroAdvisor AI</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
            Next-Gen Precision Agriculture System • 2026
          </p>
        </div>
      </footer>

    </div>
  );
}
