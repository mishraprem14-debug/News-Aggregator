import React, { useState } from "react";
import { Bookmark, ExternalLink, Clock, User, Newspaper } from "lucide-react";
import { useSavedNews } from "../context/SavedNewsContext";

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch (e) {
    return "Recently";
  }
}

export default function EverythingCard(props) {
  const { isSaved, toggleSave } = useSavedNews();
  const [imageError, setImageError] = useState(false);

  const article = {
    title: props.title || props.cardTitle || "Headline Unavailable",
    description: props.description || props.cardDescription || "",
    imgUrl: props.imgUrl || props.imageUrlLeft || props.urlToImage,
    publishedAt: props.publishedAt || props.publishedDate,
    url: props.url || "#",
    author: props.author || props.authorName || "Editorial Staff",
    source: typeof props.source === "object" ? props.source?.name : props.source || "News Source",
    category: props.category || "General"
  };

  const saved = isSaved(article.url);

  // Gradient generator for fallback image background based on title string
  const getGradient = (str) => {
    const colors = [
      "from-blue-600 to-indigo-800",
      "from-cyan-600 to-blue-800",
      "from-slate-700 to-slate-900",
      "from-indigo-600 to-purple-800",
      "from-teal-600 to-emerald-800"
    ];
    let hash = 0;
    for (let i = 0; i < (str || "").length; i++) {
      hash = (str.charCodeAt(i) + ((hash << 5) - hash));
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="group glass-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1">
      {/* Card Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {article.imgUrl && !imageError ? (
          <img
            src={article.imgUrl}
            alt={article.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(article.title)} flex flex-col items-center justify-center p-4 text-center text-white`}>
            <Newspaper className="w-10 h-10 mb-2 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {article.source}
            </span>
          </div>
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 shadow-sm">
          {article.category}
        </div>

        {/* Save Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(article);
          }}
          aria-label={saved ? "Remove bookmark" : "Save article"}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${saved
              ? "bg-blue-600 text-white"
              : "bg-slate-900/60 hover:bg-slate-900/90 text-white"
            }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Source & Date info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[140px]">
            {article.source}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base lg:text-lg text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
            {article.description}
          </p>
        )}

        {/* Card Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{article.author || "Staff"}</span>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const currentUser = JSON.parse(localStorage.getItem("news_user") || "null");
              if (currentUser && currentUser.uid) {
                import("../services/activityService").then(({ logUserActivity }) => {
                  logUserActivity(currentUser.uid, "ARTICLE_VIEWED", {
                    articleTitle: article.title,
                    url: article.url,
                    category: article.category
                  });
                });
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            Read Story
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
