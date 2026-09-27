import React from 'react';
import { Sparkles, Compass, Cpu, Zap, BookOpen, RotateCcw, Sun, Moon } from 'lucide-react';

export default function Header({ 
  onOpenDrawer, 
  onResetDemo, 
  serverStatus, 
  noticeCount = 10,
  theme = 'dark',
  onToggleTheme
}) {
  const isGemini = serverStatus?.geminiAvailable;
  const isLight = theme === 'light';

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                NoticeBoard<span className="text-emerald-400 font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Campus Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Day Light / Dark Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-all text-xs font-semibold cursor-pointer shadow-sm"
            title={isLight ? "Switch to Cyber Dark Mode" : "Switch to Crisp Day Light Mode"}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span className="font-medium text-amber-600">Day Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-300">Dark Mode</span>
              </>
            )}
          </button>

          {/* Active Engine Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-400">
              {isGemini ? 'Gemini Semantic Embeddings' : 'Zero-Key Semantic NLP'}
            </span>
          </div>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-all text-xs font-medium cursor-pointer"
            title="Reset demo to initial landing state (Alt+R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset</span>
            <kbd className="hidden xl:inline text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">Alt+R</kbd>
          </button>

          {/* Browse All Drawer Button */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold shadow-sm hover:shadow-emerald-500/10 cursor-pointer"
            title="Browse all 10 campus notices"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Browse</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono">
              {noticeCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

