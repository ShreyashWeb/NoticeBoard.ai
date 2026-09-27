import React from 'react';
import { Sparkles, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 my-8">
      {/* Scanning status banner */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-xs text-emerald-400 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="font-semibold tracking-wide">
            NoticeBoard.ai Neural Engine
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            Extracting answering passages & resolving revisions...
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-500/80">
          Passage Retrieval
        </span>
      </motion.div>

      {/* Shimmer Skeleton Cards */}
      {[1, 2].map((item) => (
        <div
          key={item}
          className="relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-3.5 backdrop-blur-md"
        >
          {/* Shimmer gradient overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent"></div>

          {/* Header row skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded-md bg-slate-800/80 animate-pulse"></div>
              <div className="h-4 w-20 rounded-md bg-slate-800/60 animate-pulse"></div>
            </div>
            <div className="h-5 w-16 rounded-full bg-emerald-950/40 border border-emerald-800/30 animate-pulse"></div>
          </div>

          {/* Title skeleton */}
          <div className="h-6 w-3/4 rounded-lg bg-slate-800/90 animate-pulse"></div>

          {/* Passage snippet skeleton */}
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full rounded bg-slate-800/60 animate-pulse"></div>
            <div className="h-4 w-5/6 rounded bg-slate-800/40 animate-pulse"></div>
          </div>

          {/* Action skeleton */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <div className="h-3.5 w-24 rounded bg-slate-800/40 animate-pulse"></div>
            <div className="h-4 w-28 rounded bg-slate-800/60 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
