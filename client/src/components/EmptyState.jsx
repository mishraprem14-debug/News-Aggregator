import React from "react";
import { SearchX, BookmarkX, Newspaper, RefreshCw } from "lucide-react";

export default function EmptyState({
  type = "search",
  title,
  message,
  actionText,
  onAction,
}) {
  const getIcon = () => {
    switch (type) {
      case "saved":
        return <BookmarkX className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      case "category":
        return <Newspaper className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      default:
        return <SearchX className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
    }
  };

  const defaultTitle =
    type === "saved"
      ? "No Saved Articles Yet"
      : type === "category"
      ? "No Articles in this Category"
      : "No News Found";

  const defaultMessage =
    type === "saved"
      ? "Save articles to read them later offline or whenever you need quick access."
      : type === "category"
      ? "We couldn't find any recent articles under this topic. Try selecting a different category."
      : "We couldn't find any news matching your current filters or search terms. Try adjusting your query.";

  return (
    <div className="w-full max-w-lg mx-auto py-16 px-6 text-center flex flex-col items-center justify-center rounded-3xl glass-card border border-slate-200 dark:border-slate-800 shadow-sm my-8 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-6 shadow-inner">
        {getIcon()}
      </div>

      <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title || defaultTitle}
      </h3>

      <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-8">
        {message || defaultMessage}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText || "Reset Filters"}
        </button>
      )}
    </div>
  );
}
