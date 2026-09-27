import React from 'react';
import { SearchX, Sparkles, ArrowRight, ShieldAlert, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTED_QUERIES = [
  {
    title: "Workshop Details & Hardware",
    query: "What should I bring to the machine learning workshop?",
    desc: "Laptop OS requirements, deposit info & kit distribution"
  },
  {
    title: "Midterm Exam Rules",
    query: "What items are prohibited inside the examination hall?",
    desc: "Calculators, smartwatches, ID verification & entry rules"
  },
  {
    title: "Hostel Room Audits",
    query: "Are room heaters and appliances allowed in hostel blocks?",
    desc: "Safety inspections, prohibited appliances & fines"
  }
];

export default function EmptyState({ onSelectQuery, lastQuery }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-slate-900/50 border border-slate-800/90 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      {/* Ambient background blur */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-slate-800/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Elegant Illustration / Icon */}
      <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700/80 p-[1px] shadow-lg mb-5 flex items-center justify-center">
        <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
          <SearchX className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      {/* Main Exact Heading Requirement */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        No matching information found.
      </h3>

      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {lastQuery ? (
          <>
            No verified notices met the confidence threshold for <span className="text-slate-200 font-medium">"{lastQuery}"</span>. NoticeBoard.ai only returns high-confidence passages to avoid misinformation.
          </>
        ) : (
          "No verified campus notices matched your search query above the similarity threshold."
        )}
      </p>

      {/* Suggested Queries Container */}
      <div className="pt-6 border-t border-slate-800/80 text-left">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Try asking about these verified campus topics:</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {SUGGESTED_QUERIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuery(item.query)}
              className="w-full p-3.5 rounded-xl bg-slate-950/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group text-left cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <div>
                <div className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans">
                  "{item.query}"
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-3" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
