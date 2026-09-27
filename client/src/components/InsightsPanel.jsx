import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, SearchX, X, PieChart, Tag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InsightsPanel({
  isOpen,
  onClose,
  sessionStats
}) {
  if (!isOpen) return null;

  const totalSearches = sessionStats.totalSearches || 0;
  const successfulMatches = sessionStats.successfulMatches || 0;
  const noMatches = sessionStats.noMatches || 0;
  const matchRate = totalSearches > 0 ? Math.round((successfulMatches / totalSearches) * 100) : 100;
  const categoryCounts = sessionStats.categoryCounts || {};

  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCategoryCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto my-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-teal-500/40 p-5 shadow-2xl backdrop-blur-2xl text-xs font-sans relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                Session Search Insights & Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold font-mono uppercase">
                Live Analytics
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time query metrics, match precision rates, and student interest distribution.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Insights Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Metric 1: Total Queries */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Total Queries
            </div>
            <div className="text-2xl font-extrabold text-white mt-0.5 font-mono">
              {totalSearches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Precision Match Rate */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Precision Match Rate
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5 font-mono">
              {matchRate}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Strict Cutoff Rejections */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Protected No-Matches
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-0.5 font-mono">
              {noMatches}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <SearchX className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Category Query Distribution Bar Chart */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-teal-400">
            <Tag className="w-3.5 h-3.5" />
            Top Queried Campus Categories
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Session Breakdown</span>
        </div>

        {sortedCategories.length > 0 ? (
          <div className="space-y-2 pt-1">
            {sortedCategories.map(([category, count]) => {
              const percentage = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{category}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {count} {count === 1 ? 'query' : 'queries'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-500 text-xs">
            Perform searches to view category distribution bars.
          </div>
        )}
      </div>
    </motion.div>
  );
}
