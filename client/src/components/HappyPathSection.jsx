import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Cpu, 
  GitMerge, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  Zap,
  CornerDownRight
} from 'lucide-react';

const HAPPY_STEPS = [
  {
    step: "01",
    title: "Ask in Natural English",
    subtitle: "Everyday Student Inquiries",
    icon: HelpCircle,
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
    badge: "No Jargon Needed",
    description: "Type casually like 'What should I bring?' or 'Where did the workshop move?'. No need to know notice IDs or exact administration keywords.",
    example: {
      input: "What should I bring to the workshop?",
      pill: "Understands intent: 'bring' ↔ 'kit deposit, laptop, OS'"
    }
  },
  {
    step: "02",
    title: "Multi-Query Hybrid RAG",
    subtitle: "Dense Semantic + BM25 Overlap",
    icon: Cpu,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    badge: "0.65 Sem + 0.35 Keyword",
    description: "Expands the query across 3 parallel semantic vectors and blends neural cosine similarity with BM25 keyword matching to prevent false positives.",
    example: {
      input: "3-Way Query Expansion",
      pill: "Catches exact room numbers & paraphrased requirements"
    }
  },
  {
    step: "03",
    title: "Passage Extraction & Conflict Diff",
    subtitle: "Zero Fluff · Instant Timeline",
    icon: GitMerge,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    badge: "Superseded vs Current",
    description: "Never dumps 500-word walls of text. Pinpoints the exact answering sentence. When a revision notice exists, displays both with clear diffs.",
    example: {
      input: "Turing 204 ➔ Innovation 310",
      pill: "Auto-flags old room as [Superseded] and new as [Active]"
    }
  },
  {
    step: "04",
    title: "Grounding & Active Feedback",
    subtitle: "Explainable Confidence",
    icon: ShieldCheck,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    badge: "✓ Verified from Source",
    description: "Shows confidence badges, matched concept explainability, one-click citation copying, and interactive thumbs up/down active learning.",
    example: {
      input: "High-Confidence Trust Loop",
      pill: "Transparent concept alignment + session score tuning"
    }
  }
];

const PRESET_DEMO_PATHS = [
  {
    tag: "Recommended Happy Path",
    title: "Workshop Kit & Deposit",
    query: "What should I bring to the workshop?",
    outcome: "Extracts $20 refundable kit deposit & laptop requirements without exact keyword match",
    accent: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
  },
  {
    tag: "Conflict Timeline Intelligence",
    title: "Room 204 ➔ Room 310 Relocation",
    query: "Where is the machine learning robotics workshop taking place?",
    outcome: "Surfaces both original and revised notices with connected chronological diff",
    accent: "border-amber-500/40 text-amber-400 bg-amber-500/10"
  },
  {
    tag: "High-Confidence Policy Match",
    title: "Exam Prohibited Items",
    query: "What items are prohibited inside the exam hall?",
    outcome: "Extracts smartwatches, calculators & scrap paper rules with '✓ Verified from source' badge",
    accent: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
  }
];

export default function HappyPathSection({ onSelectQuery }) {
  return (
    <div className="w-full mt-10 mb-8 space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Happy Path Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          How NoticeBoard<span className="text-emerald-400">.ai</span> Works
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal">
          From natural language questions to verified, passage-level campus answers with conflict intelligence.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {HAPPY_STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-emerald-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} border flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Step Micro Example */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] space-y-1.5">
                <div className="text-slate-300 font-medium truncate flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate italic">"{item.example.input}"</span>
                </div>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                  {item.example.pill}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive "Try the Happy Path" Launcher */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Experience The Happy Path in 1 Click</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any verified query below to witness real-time RAG deliberation and passage extraction.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
            100% Guaranteed Hit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {PRESET_DEMO_PATHS.map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuery(demo.query)}
              className="text-left p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-emerald-500/10"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${demo.accent}`}>
                    {demo.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors pt-1">
                  "{demo.query}"
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  {demo.outcome}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
                <span className="group-hover:text-emerald-400 font-medium">Click to execute &rarr;</span>
                <span className="font-mono">Sub-50ms</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
