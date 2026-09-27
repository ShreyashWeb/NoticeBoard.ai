import React from 'react';
import { History, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueryHistoryBar({ history = [], onSelectQuery, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="w-full max-w-3xl mx-auto mt-2 mb-4 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs gap-2 overflow-hidden"
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 py-0.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recent ({history.length}):</span>
        </span>

        <div className="flex items-center gap-1.5 flex-nowrap">
          {history.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuery(item)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[11px] transition-all flex items-center gap-1 group cursor-pointer"
              title={`Re-run: "${item}"`}
            >
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{item}</span>
              <ArrowRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onClearHistory}
        className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors text-[10px] flex-shrink-0"
        title="Clear search history"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
