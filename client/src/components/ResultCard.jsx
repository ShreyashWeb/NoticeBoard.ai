import React, { useState } from 'react';
import { Calendar, Tag, ChevronDown, ChevronUp, Copy, Check, Sparkles, HelpCircle, ArrowRight, Quote, Info, Link2, ThumbsUp, ThumbsDown, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, getConfidenceProps, HighlightedPassage } from '../utils/formatters';

export default function ResultCard({
  result,
  query,
  allNotices = [],
  onSelectFollowUp,
  onFeedback,
  feedbackState = null,
  index = 0
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const fullNotice = allNotices.find(n => n.id === result.noticeId);
  const conf = getConfidenceProps(result.score);

  // Feature 2: Grounding Badge calculation
  const isHighConfidence = result.score >= 0.70;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(result.passage);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyCitation = () => {
    const citation = `"${result.passage}"\n\n— Source: ${result.title} (Published: ${formatDate(result.date)}) · NoticeBoard.ai Campus Intelligence`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const matchedConcepts = result.matchedConcepts || [];
  const followUps = result.followUps || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 border transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-2xl backdrop-blur-xl p-5 sm:p-6 ${
        feedbackState === 'down'
          ? 'border-slate-800 opacity-75'
          : feedbackState === 'up'
          ? 'border-emerald-500/50 shadow-emerald-500/5'
          : 'border-slate-800 hover:border-emerald-500/40'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Feature 2: Prominent Grounding Badge */}
          {isHighConfidence ? (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified from source</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Possible match</span>
            </span>
          )}

          {fullNotice?.category && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400" />
              {fullNotice.category}
            </span>
          )}

          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formatDate(result.date)}
          </span>
        </div>

        {/* Confidence Percentage Chip */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${conf.barClass} rounded-full transition-all duration-500`}
              style={{ width: `${conf.percentage}%` }}
            ></div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${conf.badgeClass} flex items-center gap-1.5 ${
              conf.isHigh ? 'animate-pulse-subtle' : ''
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`}></span>
            {conf.percentage}% match
          </span>
        </div>
      </div>

      {/* Notice Title */}
      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-3 tracking-tight">
        {result.title}
      </h3>

      {/* Extracted Passage Card */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[15px] sm:text-base text-slate-100 font-medium leading-relaxed font-sans shadow-inner">
        <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Answering Passage:
        </div>
        <HighlightedPassage text={result.passage} query={query} />
      </div>


      {/* "Why this match" Explainability Pill */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowExplain(!showExplain)}
          className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors cursor-pointer py-0.5"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Why this match? {showExplain ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {showExplain && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs space-y-2 font-mono"
            >
              <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Semantic & Hybrid Token Breakdown:
              </div>
              {matchedConcepts.length > 0 ? (
                <div className="space-y-1.5">
                  {matchedConcepts.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-1.5 text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        "{c.queryTerm}"
                      </span>
                      <span className="text-emerald-400 font-bold">↔</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
                        "{c.matchedTerm}"
                      </span>
                      <span className="text-slate-400 text-[11px] font-sans">
                        ({c.relation})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 font-sans text-xs">
                  Matched via vector cosine similarity across notice title and body entities.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "Ask a follow-up" Contextual Questions */}
      {followUps.length > 0 && onSelectFollowUp && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
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

      {/* Card Footer Actions (Feedback Loop & Citation) */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isExpanded ? 'Hide complete notice' : 'View full notice'}</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Feature 1: In-Memory Feedback Loop (Thumbs Up / Down) */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono pr-1">Helpful?</span>
            <button
              type="button"
              onClick={() => onFeedback && onFeedback(result.noticeId, 'up')}
              className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                feedbackState === 'up' ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-300'
              }`}
              title="Helpful match"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onFeedback && onFeedback(result.noticeId, 'down')}
              className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                feedbackState === 'down' ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'
              }`}
              title="Not helpful (lowers rank in-session)"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Copy Snippet */}
          <button
            type="button"
            onClick={handleCopySnippet}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Copy answering snippet"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied snippet</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* One-click "Copy answer + source" with proper citation */}
          <button
            type="button"
            onClick={handleCopyCitation}
            className="text-slate-300 hover:text-emerald-300 bg-slate-950 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shadow-sm"
            title="Copy answer with full title and date citation"
          >
            {copiedCitation ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Citation Copied!</span>
              </>
            ) : (
              <>
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy Answer + Source</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expand-in-place full notice */}
      <AnimatePresence>
        {isExpanded && fullNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-slate-800"
          >
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line font-sans">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Official Campus Document Text (ID: {fullNotice.id})
              </div>
              {fullNotice.body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
