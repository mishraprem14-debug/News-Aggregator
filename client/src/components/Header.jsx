import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import countries from "./countries";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSavedNews } from "../context/SavedNewsContext";
import {
  Newspaper,
  Sun,
  Moon,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Menu,
  X,
  Compass,
  LogIn,
  UserPlus
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal, openProfileModal, logout } = useAuth();
  const { savedCount } = useSavedNews();
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
    "politics"
  ];

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCountryDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdowns on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setCountryDropdownOpen(false);
        setCategoryDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoClick = (e) => {
    setMobileMenuOpen(false);
    setCountryDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setUserDropdownOpen(false);

    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("refresh-home-news"));
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 glass-header shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between py-2 sm:py-3">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-2.5 group transition-transform active:scale-95 min-w-0 flex-shrink"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:rotate-6 transition-transform flex-shrink-0">
            <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-serif-headline truncate">
              News <span className="text-blue-600 dark:text-blue-400">App</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1 hidden sm:block">
              Global Headlines
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {/* Home Link */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className={`transition-colors py-1.5 px-3 rounded-xl ${location.pathname === "/"
              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
              : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
          >
            All News
          </Link>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setCountryDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-500" />
              <span>Headlines</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 glass-card bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-800 animate-fade-in z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/top-headlines/${cat}`}
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold capitalize text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Countries Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCountryDropdownOpen(!countryDropdownOpen);
                setCategoryDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Countries</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${countryDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {countryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 glass-card bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xl border border-slate-200 dark:border-slate-800 animate-fade-in z-50 max-h-72 overflow-y-auto">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                  Select Edition
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {countries.map((c) => (
                    <Link
                      key={c.iso_2_alpha}
                      to={`/country/${c.iso_2_alpha}`}
                      onClick={() => setCountryDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors truncate"
                    >
                      <img
                        src={c.png}
                        alt={c.countryName}
                        className="w-4 h-3 object-cover rounded-xs"
                      />
                      <span className="truncate">{c.countryName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Articles Link */}
          <Link
            to="/saved"
            className="relative flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved</span>
            {user && savedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                {savedCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle & User Auth (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switch Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark and Light theme"
            className="p-2.5 rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105 transition-all shadow-sm"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setCountryDropdownOpen(false);
                  setCategoryDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-blue-100"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 glass-card bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-800 animate-fade-in z-50">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openProfileModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/saved");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors text-left"
                  >
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    Saved Stories ({savedCount})
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                onClick={() => openAuthModal("login")}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls (Theme Toggle & Hamburger Menu) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark and light theme"
            className="p-2 rounded-xl glass-card text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel & Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Floating Dropdown Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full right-3 sm:right-6 mt-2 w-[calc(100vw-24px)] max-w-sm glass-card bg-white/95 dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-fade-in z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* 1. Mobile Authentication Section */}
            <div className="pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800">
              {user ? (
                <div className="space-y-3">
                  {/* User Avatar & Info */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full bg-blue-100 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Logged-In User Actions */}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/saved");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Saved News</span>
                      </span>
                      {savedCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {savedCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Account Access
                  </div>
                  <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("login");
                      }}
                      className="flex-1 min-w-[100px] py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <LogIn className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                      <span>Sign In</span>
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("signup");
                      }}
                      className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold text-center shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Navigation Links */}
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4 text-blue-500" />
                <span>All News Stream</span>
              </Link>

              {/* Categories Grid */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                  Categories
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/top-headlines/${cat}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs font-medium capitalize hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                  Popular Regions
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {countries.slice(0, 14).map((c) => (
                    <Link
                      key={c.iso_2_alpha}
                      to={`/country/${c.iso_2_alpha}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs font-medium truncate"
                    >
                      <img src={c.png} alt={c.countryName} className="w-3.5 h-2.5 rounded-xs flex-shrink-0" />
                      <span className="truncate">{c.countryName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
