import React from "react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Top Loading Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-900 overflow-hidden z-50">
        <div className="absolute top-0 bottom-0 bg-emerald-500 rounded-full animate-progress-loading shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>

      {/* Center Spinner & Loading Message */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-10 h-10">
          {/* Subtle Outer Track */}
          <div className="absolute inset-0 rounded-full border-3 border-slate-200 dark:border-slate-800"></div>
          {/* Active Spinning Track */}
          <div className="absolute inset-0 rounded-full border-3 border-t-emerald-500 animate-spin"></div>
        </div>
        
        {/* Syncing Data text */}
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 animate-pulse tracking-wider uppercase">
          Syncing data...
        </p>
      </div>
    </div>
  );
}
