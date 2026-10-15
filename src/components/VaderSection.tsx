import React, { useState } from 'react';
import { Sparkles, HelpCircle, ArrowRight, Gauge, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { OverallSummary, CommentItem } from '../types';

interface VaderSectionProps {
  summary: OverallSummary;
  comments: CommentItem[];
  darkMode: boolean;
}

export const VaderSection: React.FC<VaderSectionProps> = ({ summary, comments, darkMode }) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  const filteredComments = comments.filter((c) => {
    if (filter === 'all') return true;
    return c.vader.sentiment === filter;
  });

  const distData = [
    { name: 'Positive', count: summary.vader_distribution.positive, pct: summary.vader_distribution.positive_pct, color: darkMode ? '#88C9A1' : '#285943' },
    { name: 'Neutral', count: summary.vader_distribution.neutral, pct: summary.vader_distribution.neutral_pct, color: darkMode ? '#A5C2AC' : '#A3BFA8' },
    { name: 'Negative', count: summary.vader_distribution.negative, pct: summary.vader_distribution.negative_pct, color: darkMode ? '#F87171' : '#DC2626' },
  ];

  // Compound score bucket distribution: [-1 to -0.5], [-0.5 to -0.05], [-0.05 to 0.05], [0.05 to 0.5], [0.5 to 1.0]
  const compoundBuckets = [
    { range: 'Strongly Neg (-1.0 to -0.5)', count: comments.filter(c => c.vader.compound <= -0.5).length },
    { range: 'Mildly Neg (-0.5 to -0.05)', count: comments.filter(c => c.vader.compound > -0.5 && c.vader.compound <= -0.05).length },
    { range: 'Neutral (-0.05 to +0.05)', count: comments.filter(c => c.vader.compound > -0.05 && c.vader.compound < 0.05).length },
    { range: 'Mildly Pos (+0.05 to +0.5)', count: comments.filter(c => c.vader.compound >= 0.05 && c.vader.compound < 0.5).length },
    { range: 'Strongly Pos (+0.5 to +1.0)', count: comments.filter(c => c.vader.compound >= 0.5).length },
  ];

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1C3025' : '#FFFFFF',
    borderColor: darkMode ? '#263D30' : '#E2ECE5',
    color: darkMode ? '#EAF5EC' : '#24382D',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="bg-[#E8F1EA] dark:bg-[#15271D] p-6 rounded-2xl border border-[#A3BFA8]/40 dark:border-[#243E2E]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#285943] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-[#285943] dark:text-[#88C9A1]">
              How VADER (Valence Aware Dictionary and sEntiment Reasoner) Works
            </h2>
            <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#A5C2AC]">
              VADER is a rule-based sentiment analysis engine tuned specifically for social media microtexts. It combines a gold-standard sentiment lexicon with five grammatical and syntactical heuristics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">1. Punctuation Booster</span>
                <span className="text-[#718579] dark:text-[#A5C2AC]">Exclamation points amplify valence: "great!" (+0.29) vs "great!!!" (+0.87).</span>
              </div>
              <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">2. ALL-CAPS Intensity</span>
                <span className="text-[#718579] dark:text-[#A5C2AC]">Capitalized words receive a 1.5x magnitude multiplier: "LOVE" &gt; "love".</span>
              </div>
              <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">3. Compound Formula</span>
                <span className="text-[#718579] dark:text-[#A5C2AC]">Sums valence scores normalized between -1.0 (most negative) and +1.0 (most positive).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Distribution */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
          <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC] mb-1">
            VADER Sentiment Distribution
          </h3>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Percentage and volume across the standard threshold intervals
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                <XAxis type="number" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] text-center text-xs">
            <div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold block">{summary.vader_distribution.positive}</span>
              <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">Positive (&ge; 0.05)</span>
            </div>
            <div>
              <span className="text-[#24382D] dark:text-[#EAF5EC] font-bold block">{summary.vader_distribution.neutral}</span>
              <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">Neutral (-0.05 to 0.05)</span>
            </div>
            <div>
              <span className="text-rose-700 dark:text-rose-400 font-bold block">{summary.vader_distribution.negative}</span>
              <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">Negative (&le; -0.05)</span>
            </div>
          </div>
        </div>

        {/* Compound Score Distribution Histogram */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
          <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC] mb-1">
            Compound Valence Spread
          </h3>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Comment counts grouped across five polarity intervals
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compoundBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: darkMode ? '#A5C2AC' : '#718579' }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={darkMode ? '#88C9A1' : '#285943'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] text-xs text-[#718579] dark:text-[#A5C2AC]">
            <span>Mean Compound: {comments.length ? (comments.reduce((acc, c) => acc + c.vader.compound, 0) / comments.length).toFixed(3) : 0}</span>
            <span className="font-semibold text-[#285943] dark:text-[#88C9A1]">Normalized Formula</span>
          </div>
        </div>
      </div>

      {/* Individual Comment Scores Table */}
      <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              VADER Lexicon Scoring Breakdown
            </h3>
            <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
              Direct inspection of Pos, Neg, Neu, and Compound values calculated per comment
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F7FAF7] dark:bg-[#15271D] rounded-lg border border-[#E2ECE5] dark:border-[#243E2E] text-xs">
            {(['all', 'positive', 'neutral', 'negative'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#285943] text-white shadow-sm dark:bg-[#88C9A1] dark:text-[#101D17]'
                    : 'text-[#718579] dark:text-[#A5C2AC] hover:text-[#24382D] dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2ECE5] dark:border-[#243E2E] text-[#718579] dark:text-[#A5C2AC]">
                <th className="pb-3 font-bold">Comment Text</th>
                <th className="pb-3 font-bold">Author</th>
                <th className="pb-3 font-bold text-center">Positive</th>
                <th className="pb-3 font-bold text-center">Neutral</th>
                <th className="pb-3 font-bold text-center">Negative</th>
                <th className="pb-3 font-bold text-center">Compound Score</th>
                <th className="pb-3 font-bold text-right">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE5] dark:divide-[#243E2E]">
              {filteredComments.slice(0, 10).map((c) => (
                <tr key={c.id} className="hover:bg-[#F7FAF7] dark:hover:bg-[#15271D]/50 transition-colors">
                  <td className="py-3 pr-4 max-w-xs truncate font-medium text-[#24382D] dark:text-[#EAF5EC]">
                    "{c.text}"
                  </td>
                  <td className="py-3 text-[#718579] dark:text-[#A5C2AC]">
                    @{c.author}
                  </td>
                  <td className="py-3 text-center font-mono text-emerald-700 dark:text-emerald-400">
                    {c.vader.pos.toFixed(2)}
                  </td>
                  <td className="py-3 text-center font-mono text-[#718579] dark:text-[#A5C2AC]">
                    {c.vader.neu.toFixed(2)}
                  </td>
                  <td className="py-3 text-center font-mono text-rose-700 dark:text-rose-400">
                    {c.vader.neg.toFixed(2)}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      c.vader.compound >= 0.05
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : c.vader.compound <= -0.05
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {c.vader.compound > 0 ? `+${c.vader.compound.toFixed(2)}` : c.vader.compound.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-semibold capitalize ${
                      c.vader.sentiment === 'positive'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : c.vader.sentiment === 'negative'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-[#718579] dark:text-[#A5C2AC]'
                    }`}>
                      {c.vader.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
