import React, { useState } from "react";
import { useSavedNews } from "../context/SavedNewsContext";
import EverythingCard from "./EverythingCard";
import EmptyState from "./EmptyState";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SavedNews() {
  const { savedArticles, clearSaved } = useSavedNews();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filtered = savedArticles.filter((article) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (article.title && article.title.toLowerCase().includes(term)) ||
      (article.description && article.description.toLowerCase().includes(term)) ||
      (article.source && article.source.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 min-h-[80vh]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4 fill-current" />
            Saved Collection
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-serif-headline">
            Bookmarked News ({savedArticles.length})
          </h1>
        </div>

        {savedArticles.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Search Input inside Saved Articles */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved..."
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={clearSaved}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Content Grid or Empty State */}
      {savedArticles.length === 0 ? (
        <EmptyState
          type="saved"
          title="No Bookmarked News Yet"
          message="Keep track of breaking stories, in-depth reports, and interesting articles by clicking the bookmark icon on any news card."
          actionText="Explore Latest Headlines"
          onAction={() => navigate("/")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          type="search"
          title="No Matching Bookmarks"
          message={`No saved articles matched your search query "${searchTerm}".`}
          actionText="Clear Search"
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
          {filtered.map((item, index) => (
            <EverythingCard
              key={item.url || index}
              title={item.title}
              description={item.description}
              imgUrl={item.imgUrl || item.urlToImage}
              publishedAt={item.publishedAt}
              url={item.url}
              author={item.author}
              source={item.source}
              category={item.category || "Saved"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
