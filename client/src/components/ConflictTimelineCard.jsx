import React, { useState } from 'react';
import { GitCommit, AlertTriangle, CheckCircle2, Calendar, MapPin, ChevronDown, ChevronUp, Copy, Check, Sparkles, ArrowRight, Quote, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, getConfidenceProps, HighlightedPassage } from '../utils/formatters';

export default function ConflictTimelineCard({
  supersededNotice,
  currentNotice,
  query,
  allNotices = [],
  onSelectFollowUp
}) {
  const [expandedSuperseded, setExpandedSuperseded] = useState(false);
  const [expandedCurrent, setExpandedCurrent] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fullSuperseded = allNotices.find(n => n.id === supersededNotice.noticeId);
  const fullCurrent = allNotices.find(n => n.id === currentNotice.noticeId);

  const handleCopyCitation = (id, notice, isSuperseded = false) => {
    const statusNote = isSuperseded ? ' [SUPERSEDED]' : ' [ACTIVE REVISION]';
    const citation = `"${notice.passage}"\n\n— Source: ${notice.title}${statusNote} (Published: ${formatDate(notice.date)}) · NoticeBoard.ai Campus Intelligence`;
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const supersededConf = getConfidenceProps(supersededNotice.score);
  const currentConf = getConfidenceProps(currentNotice.score);

  const hasVenueDiff = (
    (supersededNotice.passage.includes("Room 204") || supersededNotice.title.includes("Room 204")) &&
    (currentNotice.passage.includes("Room 310") || currentNotice.title.includes("Room 310"))
  );

  const followUps = currentNotice.followUps || [
    "What time does the robotics workshop start?",
    "What software is required for the workshop?"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Badge & Alert Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">
                Revision Conflict Detected
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Timeline Resolution
              </span>
            </div>
            <p className="text-xs text-slate-400">
              An updated notice has superseded earlier information. Both versions are displayed below chronologically.
            </p>
          </div>
        </div>

        {/* Diff Summary Pill */}
        {hasVenueDiff && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono shadow-inner">
            <span className="text-rose-400 line-through">Room 204 (Turing Block)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-bold">Room 310 (Innovation Lab)</span>
          </div>
        )}
      </div>

      {/* Timeline Connected Cards */}
      <div className="relative mt-5 space-y-6">
        {/* Timeline connector vertical bar */}
        <div className="hidden sm:block absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-700 via-amber-500/50 to-emerald-500"></div>

        {/* 1. SUPERSEDED (ORIGINAL) NOTICE */}
        <div className="relative sm:pl-12">
          <div className="hidden sm:flex absolute left-4 top-4 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-600 items-center justify-center text-slate-400">
            <GitCommit className="w-3 h-3" />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition-all opacity-85 hover:opacity-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 line-through decoration-rose-400/80">
                  Original Notice (Superseded)
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {formatDate(supersededNotice.date)}
                </span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${supersededConf.badgeClass}`}>
                {supersededConf.percentage}% match
              </span>
            </div>

            <h4 className="text-base font-semibold text-slate-300 line-through decoration-slate-500 mb-2">
              {supersededNotice.title}
            </h4>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Original Passage:
              </div>
              <HighlightedPassage text={supersededNotice.passage} query={query} />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setExpandedSuperseded(!expandedSuperseded)}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                {expandedSuperseded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{expandedSuperseded ? 'Hide full notice' : 'View full original notice'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyCitation(supersededNotice.noticeId, supersededNotice, true)}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-xs"
              >
                {copiedId === supersededNotice.noticeId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Quote className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedId === supersededNotice.noticeId ? 'Citation Copied' : 'Copy Citation'}</span>
              </button>
            </div>

            <AnimatePresence>
              {expandedSuperseded && fullSuperseded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2 font-mono whitespace-pre-line"
                >
                  {fullSuperseded.body}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. CURRENT (UPDATED) REVISION NOTICE */}
        <div className="relative sm:pl-12">
          <div className="hidden sm:flex absolute left-4 top-4 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-950 border-2 border-emerald-400 items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>

          <div className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-slate-900/90 to-emerald-950/20 p-4 shadow-lg shadow-emerald-950/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Updated Notice (Active Revision)
                </span>
                <span className="text-xs text-emerald-400/90 flex items-center gap-1 font-mono font-medium">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  {formatDate(currentNotice.date)}
                </span>
              </div>

              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${currentConf.badgeClass} font-bold animate-pulse-subtle`}>
                {currentConf.percentage}% active match
              </span>
            </div>

            <h4 className="text-base font-bold text-white mb-2">
              {currentNotice.title}
            </h4>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-sm text-slate-100 leading-relaxed shadow-inner">
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Latest Verified Information:
              </div>
              <HighlightedPassage text={currentNotice.passage} query={query} />
            </div>

            {/* Explainability toggle for Conflict Card */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowExplain(!showExplain)}
                className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Why this conflict was flagged? {showExplain ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {showExplain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs space-y-1.5 font-mono"
                  >
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Revision Graph & Entity Diff:
                    </div>
                    <div className="text-slate-300 space-y-1 font-sans">
                      <div>• Notice <strong>{currentNotice.noticeId}</strong> explicitly declared <code className="text-emerald-400">isRevisionOf: "{supersededNotice.noticeId}"</code>.</div>
                      <div>• Spatial Entity Conflict: Original room (<span className="line-through text-rose-400">Room 204</span>) superseded by updated room (<span className="text-emerald-400 font-semibold">Room 310</span>).</div>
                      <div>• Both notices surfaced to prevent outdated attendance errors.</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card Actions */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setExpandedCurrent(!expandedCurrent)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                {expandedCurrent ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{expandedCurrent ? 'Hide full notice' : 'View full updated notice'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyCitation(currentNotice.noticeId, currentNotice, false)}
                className="text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-medium text-xs shadow-sm"
              >
                {copiedId === currentNotice.noticeId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Quote className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{copiedId === currentNotice.noticeId ? 'Citation Copied!' : 'Copy Answer + Source'}</span>
              </button>
            </div>

            <AnimatePresence>
              {expandedCurrent && fullCurrent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2 font-mono whitespace-pre-line"
                >
                  {fullCurrent.body}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Follow-up Questions for Conflict Card */}
      {followUps.length > 0 && onSelectFollowUp && (
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Suggested Follow-up Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {followUps.map((fq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectFollowUp(fq)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs transition-all flex items-center gap-1 group text-left cursor-pointer"
              >
                <span>{fq}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
