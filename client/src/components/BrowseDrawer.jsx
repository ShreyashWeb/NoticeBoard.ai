import React, { useState } from 'react';
import { X, Search, Calendar, Tag, AlertCircle, ArrowUpRight, GitCommit, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/formatters';

const CATEGORIES = ['All', 'Registration', 'Workshop', 'Facilities', 'Clubs', 'Exams', 'Hostel', 'Finance', 'Sports', 'Academics'];

export default function BrowseDrawer({
  isOpen,
  onClose,
  notices = [],
  onSelectNotice
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterText, setFilterText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredNotices = notices.filter(n => {
    const matchesCat = selectedCategory === 'All' || n.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesText = !filterText || (
      n.title.toLowerCase().includes(filterText.toLowerCase()) ||
      n.body.toLowerCase().includes(filterText.toLowerCase()) ||
      n.category.toLowerCase().includes(filterText.toLowerCase())
    );
    return matchesCat && matchesText;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md sm:max-w-lg bg-slate-950 border-l border-slate-800/80 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  {notices.length}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Campus Notice Catalog
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official database of {notices.length} verified notices
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 space-y-3">
              {/* Drawer Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter notices by keyword..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notices List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotices.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No notices match the selected category/keyword.
                </div>
              ) : (
                filteredNotices.map((notice) => {
                  const isExpanded = expandedId === notice.id;
                  const isRevision = !!notice.isRevisionOf;
                  const isSuperseded = notice.revisionStatus?.isSuperseded;

                  return (
                    <div
                      key={notice.id}
                      className={`rounded-xl border transition-all ${
                        isSuperseded
                          ? 'border-rose-900/40 bg-rose-950/10'
                          : isRevision
                          ? 'border-emerald-500/30 bg-emerald-950/10'
                          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                      } p-3.5 space-y-2`}
                    >
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
                            {notice.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(notice.publishedDate)}
                          </span>
                        </div>

                        {/* Status tag */}
                        {isSuperseded ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Superseded
                          </span>
                        ) : isRevision ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active Revision
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            {notice.id}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`text-sm font-semibold text-white leading-snug ${isSuperseded ? 'line-through decoration-rose-400/60' : ''}`}>
                        {notice.title}
                      </h4>

                      {/* Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>{isExpanded ? 'Collapse' : 'Read Notice'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectNotice(notice);
                            onClose();
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-emerald-500/10 transition-colors"
                        >
                          <span>Ask about this</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-line border-t border-slate-800/60"
                          >
                            {notice.body}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
