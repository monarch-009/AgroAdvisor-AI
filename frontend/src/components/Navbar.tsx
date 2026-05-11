"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import {
  Leaf,
  BarChart3,
  Search,
  LayoutDashboard,
  IndianRupee,
  Tractor,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Crop Guide",
    children: [
      { label: "Crop Recommendation", href: "/crop-recommendation", icon: BarChart3, color: "text-blue-600", desc: "AI Advice" },
      { label: "Disease Detection", href: "/disease-detection", icon: Search, color: "text-rose-500", desc: "Visual AI" },
      { label: "Crop Encyclopedia", href: "/crop-encyclopedia", icon: Leaf, color: "text-emerald-500", desc: "Farming Ideas" },
    ],
  },
  {
    label: "Marketplace",
    children: [
      { label: "Mandi Price", href: "/market-prices", icon: IndianRupee, color: "text-green-600", desc: "Live Rates" },
    ],
  },
  {
    label: "Analytics",
    children: [
      { label: "Regional Analysis", href: "/regional-analysis", icon: BarChart3, color: "text-purple-600", desc: "Regional Insights" },
    ],
  },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onEnter = (label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenMenu(label);
  };
  const onLeave = () => {
    timerRef.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-white border-b border-gray-100"
        }`}
    >
      <div className="mx-auto max-w-6xl px-8 lg:px-24 h-18 flex items-center justify-between">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 no-underline group shrink-0">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100 transition-transform group-hover:scale-105">
            <Leaf size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
              AgroAdvisor<span className="text-green-600">AI</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Smart Agriculture</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const hasChildren = "children" in item;
            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={(item as any).href}
                  className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${pathname === (item as any).href ? "text-green-700 bg-green-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => onEnter(item.label)}
                onMouseLeave={onLeave}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-xl text-[14px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                  {item.label}
                  <ChevronDown size={14} className={`opacity-40 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} />
                </button>

                {openMenu === item.label && (
                  <div className="animate-dropdown absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-200">

                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-white transition-all ${child.color}`}>
                          <child.icon size={16} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-gray-800">{child.label}</span>
                          <span className="block text-[10px] text-gray-400">{child.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-5 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}

          <button
            className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-60 bg-white p-8 lg:hidden flex flex-col gap-8 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">AgroAdvisor AI</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 bg-gray-50 rounded-xl"><X size={28} /></button>
          </div>
          <div className="flex flex-col gap-6">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.label}
                href={(item as any).href || '#'}
                onClick={() => setMobileOpen(false)}
                className="text-3xl font-black text-gray-900 hover:text-green-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto pb-8 border-t border-gray-100 pt-8">
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  );
}
