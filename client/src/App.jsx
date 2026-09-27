import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, ShieldCheck, Zap, Layers, RefreshCw, GitCommit, Search, CheckCircle2, ChevronRight, HelpCircle, RotateCcw, Terminal, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import AnalyticsStrip from './components/AnalyticsStrip';
import QueryHistoryBar from './components/QueryHistoryBar';
import SearchBar from './components/SearchBar';
import SearchLoading from './components/SearchLoading';
import ResultCard from './components/ResultCard';
import ConflictTimelineCard from './components/ConflictTimelineCard';
import EmptyState from './components/EmptyState';
import BrowseDrawer from './components/BrowseDrawer';
import DebugInspector from './components/DebugInspector';
import InsightsPanel from './components/InsightsPanel';
import HappyPathSection from './components/HappyPathSection';

const SESSION_STORAGE_KEY = 'noticeboard_query_history';
const THEME_STORAGE_KEY = 'noticeboard_theme';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export default function App() {
  const [query, setQuery] = useState('');
  const [lastExecutedQuery, setLastExecutedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [queryExpansion, setQueryExpansion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLatency, setSearchLatency] = useState(null);
  const [allNotices, setAllNotices] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [audience, setAudience] = useState('students');
  const [toastMessage, setToastMessage] = useState(null);

  // Day Light / Dark Mode Theme
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Feedback state for in-memory active learning
  const [feedbackMap, setFeedbackMap] = useState({});


  // Session stats for insights panel
  const [sessionStats, setSessionStats] = useState({
    totalSearches: 0,
    successfulMatches: 0,
    noMatches: 0,
    categoryCounts: {}
  });

  const [queryHistory, setQueryHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load initial dataset on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [healthRes, noticesRes] = await Promise.all([
          fetch(`${API_BASE}/api/health`).then(r => r.json()),
          fetch(`${API_BASE}/api/notices`).then(r => r.json())
        ]);
        setServerStatus(healthRes);
        if (noticesRes?.notices) {
          setAllNotices(noticesRes.notices);
        }
      } catch {}
    }
    loadInitialData();
  }, []);


  // Demo Reset Action
  const handleResetDemo = useCallback(() => {
    setQuery('');
    setLastExecutedQuery('');
    setResults([]);
    setQueryExpansion(null);
    setIsLoading(false);
    setHasSearched(false);
    setSearchLatency(null);
    setQueryHistory([]);
    setIsDebugOpen(false);
    setIsInsightsOpen(false);
    setFeedbackMap({});
    setSessionStats({
      totalSearches: 0,
      successfulMatches: 0,
      noMatches: 0,
      categoryCounts: {}
    });
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}

    setToastMessage('Demo state reset to pristine landing page');
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Keyboard shortcuts: Alt+R (reset), Alt+D (debug inspector)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'r') || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        handleResetDemo();
      }
      if ((e.altKey && e.key.toLowerCase() === 'd') || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        setIsDebugOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetDemo]);

  // Save query to history
  const addQueryToHistory = (newQuery) => {
    if (!newQuery || !newQuery.trim()) return;
    const clean = newQuery.trim();
    setQueryHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  };

  // Feature 1: Feedback Handler with In-Memory Score Adjustment
  const handleFeedback = (noticeId, type) => {
    setFeedbackMap(prev => {
      const current = prev[noticeId];
      const newType = current === type ? null : type;
      
      if (newType === 'down') {
        setToastMessage('Feedback recorded: Result score reduced in-session');
      } else if (newType === 'up') {
        setToastMessage('Feedback recorded: Result boosted in-session');
      }
      setTimeout(() => setToastMessage(null), 2500);

      // Adjust score in memory
      setResults(prevResults => {
        return prevResults.map(r => {
          if (r.noticeId === noticeId) {
            let adjusted = r.score;
            if (newType === 'down') {
              adjusted = Math.max(0.15, Math.round(r.score * 0.70 * 100) / 100);
            } else if (newType === 'up') {
              adjusted = Math.min(1.0, Math.round(r.score * 1.15 * 100) / 100);
            }
            return { ...r, score: adjusted };
          }
          return r;
        }).sort((a, b) => b.score - a.score);
      });

      return { ...prev, [noticeId]: newType };
    });
  };

  // Main search handler
  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setQuery(q);
    setIsLoading(true);
    setHasSearched(true);
    setLastExecutedQuery(q);
    addQueryToHistory(q);

    const startTime = performance.now();

    try {
      // 350ms minimum for perceptual AI shimmer deliberation
      const [res] = await Promise.all([
        fetch(`${API_BASE}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, audience })
        }).then(r => r.json()),
        new Promise(resolve => setTimeout(resolve, 350))
      ]);


      const endTime = performance.now();
      setSearchLatency(Math.round(endTime - startTime));

      const returnedResults = (res && Array.isArray(res.results)) ? res.results : [];
      setResults(returnedResults);

      if (res && res.queryExpansion) {
        setQueryExpansion(res.queryExpansion);
      }

      // Update session statistics
      setSessionStats(prev => {
        const isMatch = returnedResults.length > 0;
        const newCatCounts = { ...prev.categoryCounts };

        returnedResults.forEach(r => {
          const fullN = allNotices.find(n => n.id === r.noticeId);
          if (fullN?.category) {
            newCatCounts[fullN.category] = (newCatCounts[fullN.category] || 0) + 1;
          }
        });

        return {
          totalSearches: prev.totalSearches + 1,
          successfulMatches: prev.successfulMatches + (isMatch ? 1 : 0),
          noMatches: prev.noMatches + (isMatch ? 0 : 1),
          categoryCounts: newCatCounts
        };
      });
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Identify conflict / revision pair (superseded + current)
  const supersededItem = results.find(r => r.status === 'superseded');
  const currentRevisionItem = results.find(r => r.status === 'current');
  const hasConflictPair = !!(supersededItem && currentRevisionItem);

  const regularResults = results.filter(r => {
    if (hasConflictPair) {
      return r.noticeId !== supersededItem.noticeId && r.noticeId !== currentRevisionItem.noticeId;
    }
    return true;
  });

  const topResult = results[0] || null;

  const studentCount = allNotices.filter(n => n.audience !== 'staff').length || 10;
  const staffCount = allNotices.filter(n => n.audience === 'staff').length || 2;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 font-sans transition-colors duration-200`}>
      {/* Radial glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] ${theme === 'light' ? 'bg-gradient-to-b from-emerald-500/15 via-amber-500/10 to-transparent' : 'bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent'} blur-3xl opacity-75`}></div>
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] ${theme === 'light' ? 'bg-emerald-200/30' : 'bg-emerald-950/20'} blur-3xl rounded-full`}></div>
      </div>

      {/* Floating Demo Reset / Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-xl shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onResetDemo={handleResetDemo}
        serverStatus={serverStatus}
        noticeCount={allNotices.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 pb-20 relative z-10 flex flex-col">
        {/* Analytics Strip at Top */}
        <AnalyticsStrip
          totalNotices={audience === 'students' ? studentCount : allNotices.length}
          categoryCount={9}
          revisionCount={1}
          isDebugOpen={isDebugOpen}
          onToggleDebug={() => setIsDebugOpen(!isDebugOpen)}
          isInsightsOpen={isInsightsOpen}
          onToggleInsights={() => setIsInsightsOpen(!isInsightsOpen)}
        />

        {/* Feature 4: Session Insights Panel */}
        <AnimatePresence>
          {isInsightsOpen && (
            <InsightsPanel
              isOpen={isInsightsOpen}
              onClose={() => setIsInsightsOpen(false)}
              sessionStats={sessionStats}
            />
          )}
        </AnimatePresence>

        {/* Dev / Debug Mode Inspector */}
        <AnimatePresence>
          {isDebugOpen && (
            <DebugInspector
              isOpen={isDebugOpen}
              onClose={() => setIsDebugOpen(false)}
              topResult={topResult}
              queryExpansion={queryExpansion}
              lastQuery={lastExecutedQuery}
            />
          )}
        </AnimatePresence>

        {/* Query History Bar */}
        <QueryHistoryBar
          history={queryHistory}
          onSelectQuery={(q) => {
            setQuery(q);
            handleSearch(q);
          }}
          onClearHistory={handleClearHistory}
        />

        {/* Hero Section */}
        <section className={`text-center transition-all duration-500 ${hasSearched ? 'mb-6 pt-2' : 'my-auto py-8'}`}>
          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-500/10 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Campus Notice Radar</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
                Campus Intelligence, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Answered in Seconds.
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
                Ask natural questions about deadlines, workshops, rules, or room changes. Direct passage retrieval with hybrid RAG intelligence.
              </p>
            </motion.div>
          )}

          {/* Hero Search Bar with Audience Scoping */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
            notices={allNotices}
            audience={audience}
            onToggleAudience={() => setAudience(audience === 'students' ? 'staff' : 'students')}
          />

          {/* Feature: Interactive Happy Path Explainer on Landing Page */}
          {!hasSearched && (
            <HappyPathSection
              onSelectQuery={(q) => {
                setQuery(q);
                handleSearch(q);
              }}
            />
          )}
        </section>

        {/* Dynamic Results Section */}
        <section className="w-full max-w-3xl mx-auto flex-1">

          <AnimatePresence mode="wait">
            {/* 1. Loading AI Shimmer State */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SearchLoading />
              </motion.div>
            )}

            {/* 2. Empty / No-Match State */}
            {!isLoading && hasSearched && results.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  lastQuery={lastExecutedQuery}
                  onSelectQuery={(q) => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                />
              </motion.div>
            )}

            {/* 3. Results Present */}
            {!isLoading && hasSearched && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Meta stats bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {results.length} relevant {results.length === 1 ? 'passage' : 'passages'}
                    </span>
                    <span>for <span className="text-emerald-400 font-medium font-mono">"{lastExecutedQuery}"</span></span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {searchLatency && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        {searchLatency}ms
                      </span>
                    )}
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Hybrid Score &ge; 0.35
                    </span>
                  </div>
                </div>

                {/* Conflict Timeline Card */}
                {hasConflictPair && (
                  <ConflictTimelineCard
                    supersededNotice={supersededItem}
                    currentNotice={currentRevisionItem}
                    query={lastExecutedQuery}
                    allNotices={allNotices}
                    onSelectFollowUp={(q) => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                  />
                )}

                {/* Standard Result Cards */}
                {regularResults.length > 0 && (
                  <div className="space-y-4">
                    {hasConflictPair && (
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 pt-2">
                        Other Thematic Matches
                      </div>
                    )}
                    {regularResults.map((result, idx) => (
                      <ResultCard
                        key={result.noticeId}
                        result={result}
                        query={lastExecutedQuery}
                        allNotices={allNotices}
                        onSelectFollowUp={(q) => {
                          setQuery(q);
                          handleSearch(q);
                        }}
                        onFeedback={handleFeedback}
                        feedbackState={feedbackMap[result.noticeId]}
                        index={idx}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NoticeBoard.ai — Smart Campus Search Prototype</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsInsightsOpen(!isInsightsOpen)}
              className="text-slate-400 hover:text-teal-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3 text-teal-400" />
              <span>Insights</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDebugOpen(!isDebugOpen)}
              className="text-slate-400 hover:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Dev Inspector (Alt+D)</span>
            </button>
            <span>•</span>
            <button
              onClick={handleResetDemo}
              className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              Reset Demo (Alt+R)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
            >
              Browse Notices
            </button>
          </div>
        </div>
      </footer>

      {/* Slide-over Catalog Drawer */}
      <BrowseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notices={allNotices}
        onSelectNotice={(notice) => {
          setQuery(notice.title);
          handleSearch(notice.title);
        }}
      />
    </div>
  );
}
