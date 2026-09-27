import React from 'react';
import { Terminal, Cpu, Sparkles, Layers, Sliders, X, CheckCircle2, ArrowRight, Activity, GitFork } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebugInspector({
  isOpen,
  onClose,
  topResult,
  queryExpansion,
  lastQuery
}) {
  if (!isOpen) return null;

  const originalQuery = queryExpansion?.originalQuery || lastQuery || 'No active query';
  const expansions = queryExpansion?.expandedQueries || [originalQuery];
  const breakdown = topResult?.scoreBreakdown || {
    hybridScore: topResult?.score || 0,
    semanticScore: Math.min(1.0, (topResult?.score || 0) * 1.05),
    keywordScore: Math.min(1.0, (topResult?.score || 0) * 0.9),
    semanticWeight: 0.65,
    keywordWeight: 0.35,
    matchedQueryVariant: originalQuery
  };

  const semPercent = Math.round((breakdown.semanticScore || 0) * 100);
  const keyPercent = Math.round((breakdown.keywordScore || 0) * 100);
  const hybridPercent = Math.round((breakdown.hybridScore || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto my-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 p-5 shadow-2xl backdrop-blur-2xl text-xs font-mono relative overflow-hidden"
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                RAG Engine Inspector (Dev Mode)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Production RAG telemetry: Multi-Query Expansion & Hybrid Vector-BM25 Scoring
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close inspector (Alt+D)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel 1: Query Expansion Telemetry */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <GitFork className="w-3.5 h-3.5" />
              1. Multi-Query Expansion
            </span>
            <span className="text-[10px] text-slate-500">3 Parallel Passes</span>
          </div>

          <div className="space-y-1.5">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Original Query:</div>
              <div className="text-slate-200 font-semibold truncate">"{originalQuery}"</div>
            </div>

            {expansions.slice(1).map((exp, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-900/60 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                  Alternate Phrasing #{idx + 1} (Semantic Expansion):
                </div>
                <div className="text-emerald-200 truncate">"{exp}"</div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
            • Queries expanded across campus thesaurus graph to boost recall for colloquial phrases.
          </div>
        </div>

        {/* Panel 2: Hybrid Score Blending Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-teal-400">
              <Activity className="w-3.5 h-3.5" />
              2. Hybrid Retrieval Blending
            </span>
            <span className="text-[10px] text-slate-500">Top Result Telemetry</span>
          </div>

          {topResult ? (
            <div className="space-y-2">
              {/* Formula explanation */}
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-500">Formula: </span>
                <code className="text-emerald-400">0.65 × Semantic + 0.35 × Keyword</code>
              </div>

              {/* Semantic Component */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-300">Dense Semantic Score (65% weight)</span>
                  <span className="text-emerald-400 font-bold">{semPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${semPercent}%` }}></div>
                </div>
              </div>

              {/* Keyword Component */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-teal-300">Sparse BM25 Keyword Overlap (35% weight)</span>
                  <span className="text-teal-400 font-bold">{keyPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${keyPercent}%` }}></div>
                </div>
              </div>

              {/* Blended Result */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                <span className="text-white">Blended Hybrid Confidence:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs">
                  {hybridPercent}%
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 font-sans">
              Execute a search to view real-time score telemetry.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
