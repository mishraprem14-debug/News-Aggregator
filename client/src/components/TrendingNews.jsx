import React from "react";
import { TrendingUp, Clock, ExternalLink } from "lucide-react";

export default function TrendingNews({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  const trendingList = articles.slice(0, 5);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm mb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Trending Headlines
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Top Updates
        </span>
      </div>

      <div className="space-y-4">
        {trendingList.map((item, index) => {
          const rank = String(index + 1).padStart(2, "0");
          const sourceName = typeof item.source === "object" ? item.source?.name : item.source || "News";

          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
            >
              {/* Numbered Accent Badge */}
              <span className="text-2xl font-black font-serif-headline text-slate-300 dark:text-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 w-8">
                {rank}
              </span>

              {/* Thumbnail if available */}
              {item.urlToImage && (
                <img
                  src={item.urlToImage}
                  alt={item.title}
                  className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-slate-200 dark:bg-slate-800"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {sourceName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today"}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h4>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
