import React from 'react';
import { Database, FolderTree, GitCommit, ShieldCheck, Zap, Terminal, BarChart3 } from 'lucide-react';

export default function AnalyticsStrip({
  totalNotices = 10,
  categoryCount = 9,
  revisionCount = 1,
  isDebugOpen = false,
  onToggleDebug,
  isInsightsOpen = false,
  onToggleInsights
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-2 my-2 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-y-1.5 shadow-inner">
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <span className="flex items-center gap-1 text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <strong className="text-white font-semibold">{totalNotices}</strong> notices indexed
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="flex items-center gap-1 text-slate-300">
          <FolderTree className="w-3.5 h-3.5 text-teal-400" />
          <strong className="text-white font-semibold">{categoryCount}</strong> categories
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="flex items-center gap-1 text-amber-300">
          <GitCommit className="w-3.5 h-3.5 text-amber-400" />
          <strong className="text-amber-200 font-semibold">{revisionCount}</strong> active revision
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Insights Panel Trigger */}
        <button
          type="button"
          onClick={onToggleInsights}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer text-[10px] ${
            isInsightsOpen
              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-teal-300 hover:border-slate-700'
          }`}
          title="Toggle Session Analytics & Category Insights"
        >
          <BarChart3 className="w-3 h-3 text-teal-400" />
          <span>Insights</span>
        </button>

        {/* RAG Inspector Trigger */}
        <button
          type="button"
          onClick={onToggleDebug}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer text-[10px] ${
            isDebugOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-slate-700'
          }`}
          title="Toggle RAG Hybrid & Query Expansion Inspector (Alt+D)"
        >
          <Terminal className="w-3 h-3 text-emerald-400" />
          <span>RAG Inspector</span>
          <kbd className="hidden sm:inline text-[9px] text-slate-500 font-mono">Alt+D</kbd>
        </button>
      </div>
    </div>
  );
}
