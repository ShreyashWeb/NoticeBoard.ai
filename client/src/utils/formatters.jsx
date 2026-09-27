import React from 'react';

/**
 * Format ISO date string into human-readable date
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

/**
 * Get visual styling and label for confidence score
 */
export function getConfidenceProps(score) {
  const percentage = Math.round((score || 0) * 100);

  if (score >= 0.75) {
    return {
      percentage,
      label: 'High Relevance',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      barClass: 'bg-emerald-400',
      dotClass: 'bg-emerald-400',
      isHigh: true
    };
  } else if (score >= 0.55) {
    return {
      percentage,
      label: 'Strong Match',
      badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      barClass: 'bg-teal-400',
      dotClass: 'bg-teal-400',
      isHigh: false
    };
  } else if (score >= 0.35) {
    return {
      percentage,
      label: 'Thematic Match',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      barClass: 'bg-amber-400',
      dotClass: 'bg-amber-400',
      isHigh: false
    };
  } else {
    return {
      percentage,
      label: 'Low Match',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
      barClass: 'bg-slate-500',
      dotClass: 'bg-slate-500',
      isHigh: false
    };
  }
}

/**
 * Highlights matching query terms and key campus entities inside a passage
 */
export function HighlightedPassage({ text, query }) {
  if (!text) return null;
  if (!query || !query.trim()) return <span>{text}</span>;

  // Extract meaningful search tokens (length > 2)
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['what', 'where', 'when', 'which', 'who', 'how', 'the', 'for', 'and', 'are', 'is', 'should', 'can', 'take', 'place'].includes(t));

  if (queryTokens.length === 0) return <span>{text}</span>;

  // Regex pattern matching any of the query terms
  const escapedTokens = queryTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escapedTokens})`, 'gi');

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = queryTokens.some(t => part.toLowerCase() === t.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={i}
              className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-semibold border-b border-emerald-400/50 selection:bg-emerald-400 selection:text-slate-950"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
