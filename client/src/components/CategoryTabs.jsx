import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

export default function CategoryTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  const categories = [
    { id: "all", label: "All News", path: "/" },
    { id: "general", label: "General", path: "/top-headlines/general" },
    { id: "business", label: "Business", path: "/top-headlines/business" },
    { id: "technology", label: "Technology", path: "/top-headlines/technology" },
    { id: "sports", label: "Sports", path: "/top-headlines/sports" },
    { id: "entertainment", label: "Entertainment", path: "/top-headlines/entertainment" },
    { id: "health", label: "Health", path: "/top-headlines/health" },
    { id: "science", label: "Science", path: "/top-headlines/science" },
    { id: "politics", label: "Politics", path: "/top-headlines/politics" },
  ];

  const getCurrentCategory = () => {
    if (location.pathname === "/") return "all";
    const match = location.pathname.match(/\/top-headlines\/([^/]+)/);
    return match ? match[1] : "all";
  };

  const activeCategory = getCurrentCategory();

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full my-6 flex items-center gap-2">
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll("left")}
        aria-label="Scroll categories left"
        className="hidden md:flex items-center justify-center p-2 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all shadow-sm flex-shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Horizontal Pills Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth flex-1"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                  : "glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                }`}
            >
              {cat.id === "all" && <Compass className="w-3.5 h-3.5" />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll("right")}
        aria-label="Scroll categories right"
        className="hidden md:flex items-center justify-center p-2 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all shadow-sm flex-shrink-0"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
