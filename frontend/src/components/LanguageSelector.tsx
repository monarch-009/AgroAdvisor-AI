"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi,bn,mr,te,ta,gu,ur,kn,or,ml", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (code: string) => {
    setCurrentLang(code);
    setIsOpen(false);
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
  };

  const current = languages.find((l) => l.code === currentLang)!;

  return (
    <div className="relative" ref={dropdownRef}>
      <div id="google_translate_element" className="hidden" />

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all text-sm font-semibold"
      >
        <Globe size={16} className="text-green-600 shrink-0" />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown size={14} className={`opacity-40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="animate-dropdown absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 p-2 z-[300] overflow-hidden">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Language</p>
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all mb-0.5 ${
                  currentLang === lang.code
                    ? "bg-green-600 text-white font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold ${currentLang === lang.code ? "text-green-100" : "text-gray-400"}`}>
                    {lang.code.toUpperCase()}
                  </span>
                  <span>{lang.native}</span>
                </div>
                {currentLang === lang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
