import React from "react";

export function EverythingCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm p-4 flex flex-col h-full animate-fade-in border border-slate-200 dark:border-slate-800">
      {/* Image Skeleton */}
      <div className="relative w-full h-48 rounded-xl skeleton-box mb-4 overflow-hidden" />
      
      {/* Category Pill Skeleton */}
      <div className="w-20 h-5 skeleton-box rounded-full mb-3" />

      {/* Title Lines */}
      <div className="w-full h-5 skeleton-box rounded mb-2" />
      <div className="w-3/4 h-5 skeleton-box rounded mb-4" />

      {/* Description Snippet Lines */}
      <div className="w-full h-3 skeleton-box rounded mb-1.5" />
      <div className="w-11/12 h-3 skeleton-box rounded mb-1.5" />
      <div className="w-4/5 h-3 skeleton-box rounded mb-6" />

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full skeleton-box" />
          <div className="w-20 h-4 skeleton-box rounded" />
        </div>
        <div className="w-16 h-4 skeleton-box rounded" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full glass-card rounded-3xl p-6 lg:p-8 mb-10 shadow-lg border border-slate-200 dark:border-slate-800 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 w-full h-72 lg:h-96 skeleton-box rounded-2xl" />
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          <div className="w-24 h-6 skeleton-box rounded-full" />
          <div className="w-full h-8 skeleton-box rounded" />
          <div className="w-4/5 h-8 skeleton-box rounded" />
          <div className="w-full h-4 skeleton-box rounded" />
          <div className="w-11/12 h-4 skeleton-box rounded" />
          <div className="w-3/4 h-4 skeleton-box rounded" />
          <div className="pt-4 flex items-center gap-4">
            <div className="w-32 h-10 skeleton-box rounded-xl" />
            <div className="w-10 h-10 skeleton-box rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((idx) => (
        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 skeleton-box rounded-lg flex-shrink-0" />
          <div className="w-16 h-16 skeleton-box rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-full h-4 skeleton-box rounded" />
            <div className="w-2/3 h-3 skeleton-box rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <EverythingCardSkeleton key={idx} />
      ))}
    </div>
  );
}
