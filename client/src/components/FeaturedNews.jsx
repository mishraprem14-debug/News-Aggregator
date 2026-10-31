import React from "react";
import { ExternalLink, Clock, Bookmark, Sparkles } from "lucide-react";
import { useSavedNews } from "../context/SavedNewsContext";

export default function FeaturedNews({ article }) {
  const { isSaved, toggleSave } = useSavedNews();

  if (!article) return null;

  const saved = isSaved(article.url);
  const sourceName = typeof article.source === "object" ? article.source?.name : article.source || "Featured Source";

  return (
    <div className="relative w-full glass-card rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800/80 mb-10 group animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Large Featured Image */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-900">
          {article.urlToImage ? (
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-8 text-center text-white">
              <span className="text-xl font-bold font-serif-headline text-blue-200">
                {sourceName}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

          {/* Top Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Top Story
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {sourceName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h2>

            <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed mb-6">
              {article.description || "Click below to read the full comprehensive news coverage regarding this breaking story."}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              Read Full Story
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => toggleSave(article)}
              className={`p-3 rounded-xl border transition-all duration-200 ${saved
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              title={saved ? "Remove bookmark" : "Save article"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
