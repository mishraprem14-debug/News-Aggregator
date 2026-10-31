import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="w-full max-w-lg mx-auto py-12 px-6 text-center flex flex-col items-center justify-center rounded-3xl glass-card border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 shadow-sm my-8 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Unable to Load Headlines
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {error || "A connection issue occurred while fetching news updates. Please verify your internet connection or try again."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-all active:scale-95 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
}
