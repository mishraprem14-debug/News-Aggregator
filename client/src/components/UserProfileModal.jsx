import React from "react";
import { X, User, Bookmark, LogOut, Settings, Check, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSavedNews } from "../context/SavedNewsContext";
import { useNavigate } from "react-router-dom";

export default function UserProfileModal() {
  const { user, logout, isProfileModalOpen, closeProfileModal, updatePreferences } = useAuth();
  const { savedCount } = useSavedNews();
  const navigate = useNavigate();

  if (!isProfileModalOpen || !user) return null;

  const availableCategories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
    "politics"
  ];

  const userPrefs = user.preferences || [];

  const toggleCategoryPref = (cat) => {
    let updated;
    if (userPrefs.includes(cat)) {
      updated = userPrefs.filter((c) => c !== cat);
    } else {
      updated = [...userPrefs, cat];
    }
    updatePreferences(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={closeProfileModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeProfileModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Info Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-500 shadow-md flex-shrink-0"
          />
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              closeProfileModal();
              navigate("/saved");
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left hover:border-blue-500 transition-all group"
          >
            <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {savedCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Saved Articles
            </div>
          </button>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {userPrefs.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Topic Preferences
            </div>
          </div>
        </div>

        {/* Preferred Categories Section */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Custom Feed Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => {
              const isSelected = userPrefs.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategoryPref(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex items-center gap-1.5 transition-all ${isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              logout();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={closeProfileModal}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
