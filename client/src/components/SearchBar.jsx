import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, ArrowRight, CornerDownLeft, Command, Clock, AlertTriangle, Shield, Users, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLE_QUESTIONS = [
  "What should I bring to the workshop?",
  "Where is the machine learning robotics workshop taking place?",
  "What is the deadline for course add/drop?",
  "Are electric room heaters allowed in the hostel?",
  "What items are prohibited inside the exam hall?",
  "What are the formatting rules for thesis submission?",
  "When is the semester fee payment deadline?",
  "What are the requirements for badminton tryouts?"
];

const QUICK_CHIPS = [
  { label: "Workshop Gear", query: "What should I bring to the workshop?" },
  { label: "Workshop Venue", query: "Where is the machine learning robotics workshop taking place?" },
  { label: "Exam Rules", query: "What items are prohibited inside the examination hall?" },
  { label: "Hostel Inspection", query: "Are electric appliances and heaters allowed in hostel rooms?" },
  { label: "Fee Surcharge", query: "What is the deadline and late fee penalty for semester tuition?" },
  { label: "Thesis LaTeX", query: "What are the thesis submission and LaTeX template formatting guidelines?" }
];

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  isLoading,
  notices = [],
  audience = 'students',
  onToggleAudience
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Typewriter effect for placeholder
  useEffect(() => {
    if (query) return;

    const currentQuestion = EXAMPLE_QUESTIONS[placeholderIndex];
    let timeout;

    if (!isDeleting) {
      if (displayedText.length < currentQuestion.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentQuestion.slice(0, displayedText.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentQuestion.slice(0, displayedText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUESTIONS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, placeholderIndex, query]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced live suggestions from notices
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const qLower = query.toLowerCase();
    const matched = [];

    for (const notice of notices) {
      if (notice.title.toLowerCase().includes(qLower) || notice.category.toLowerCase().includes(qLower)) {
        matched.push({
          type: 'notice',
          text: notice.title,
          category: notice.category,
          isRevision: !!notice.isRevisionOf
        });
      }
    }

    for (const eq of EXAMPLE_QUESTIONS) {
      if (eq.toLowerCase().includes(qLower) && !matched.some(m => m.text === eq)) {
        matched.push({
          type: 'question',
          text: eq,
          category: 'Natural Language'
        });
      }
    }

    setSuggestions(matched.slice(0, 4));
  }, [query, notices]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    onSearch(query);
  };

  const handleSelectSuggestion = (text) => {
    setQuery(text);
    setIsFocused(false);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20">
      {/* Search Bar Container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl transition-all duration-300 ${
          isFocused
            ? 'ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-500/10 bg-slate-900/95'
            : 'hover:border-slate-700 bg-slate-900/80 shadow-xl shadow-black/40'
        } border border-slate-800 backdrop-blur-xl`}
      >
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 sm:py-4">
          <div className="flex-shrink-0 mr-3.5 text-emerald-400">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-grow relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={query ? "" : displayedText ? `Ask anything... e.g. "${displayedText}"` : "Ask any campus question in natural language..."}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-lg font-normal focus:outline-none tracking-tight pr-8"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!query && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 font-mono select-none">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Live Autocomplete Suggestions Dropdown */}
        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-30 divide-y divide-slate-800/60"
            >
              <div className="px-3.5 py-1.5 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Suggestions</span>
                <span>Press Enter ↵</span>
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(item.text)}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-slate-200 group-hover:text-emerald-300 truncate">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex-shrink-0 ml-2 font-mono">
                    {item.category}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Feature 3: Audience Scoping Indicator Line */}
      <div className="mt-2 px-1 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-1">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span>
            {audience === 'students' ? (
              <>
                <strong className="text-slate-300 font-semibold">10 notices indexed for students</strong> (2 staff-only notices excluded)
              </>
            ) : (
              <>
                <strong className="text-amber-300 font-semibold">All 12 notices indexed</strong> (Staff / Admin View Active)
              </>
            )}
          </span>
        </div>

        {onToggleAudience && (
          <button
            type="button"
            onClick={onToggleAudience}
            className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
            title="Toggle Audience Scope"
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>Switch to {audience === 'students' ? 'Staff View' : 'Student View'}</span>
          </button>
        )}
      </div>

      {/* Quick Example Query Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs"
      >
        <span className="text-slate-400 flex-shrink-0 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" /> Try:
        </span>
        <div className="flex items-center gap-2 flex-nowrap">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(chip.query)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-900/70 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all text-xs flex items-center gap-1.5 group shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <span className="group-hover:text-emerald-400 font-medium">{chip.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
