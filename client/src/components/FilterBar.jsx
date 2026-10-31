import React, { useState } from "react";
import { Search, SlidersHorizontal, X, Globe, Calendar, ArrowUpDown } from "lucide-react";
import countries from "./countries";
import FilterDrawer from "./FilterDrawer";

export default function FilterBar({
  searchQuery = "",
  onSearchChange,
  selectedCountry = "",
  onCountryChange,
  sortOption = "publishedAt",
  onSortChange,
  onClearFilters,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedCountry ? 1 : 0) +
    (sortOption !== "publishedAt" ? 1 : 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full my-6 animate-fade-in">
      {/* Desktop Filter Bar Container */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search breaking headlines..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Desktop Quick Dropdowns */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Country Selector */}
          <div className="relative flex items-center">
            <Globe className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.iso_2_alpha} value={c.iso_2_alpha}>
                  {c.countryName} ({c.iso_2_alpha.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
            >
              <option value="publishedAt">Latest First</option>
              <option value="relevance">Relevance</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer Trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="md:hidden w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-98 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1 text-xs">
          <span className="text-slate-400 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Query: "{searchQuery}"
              <button onClick={() => onSearchChange("")}>
                <X className="w-3 h-3 hover:text-blue-900 dark:hover:text-white" />
              </button>
            </span>
          )}
          {selectedCountry && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Country: {selectedCountry.toUpperCase()}
              <button onClick={() => onCountryChange("")}>
                <X className="w-3 h-3 hover:text-blue-900 dark:hover:text-white" />
              </button>
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-red-500 underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Mobile Drawer Sheet */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCountry={selectedCountry}
        onCountryChange={onCountryChange}
        sortOption={sortOption}
        onSortChange={onSortChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
