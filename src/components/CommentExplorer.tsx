import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Cpu,
  Smile,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { CommentItem } from '../types';

interface CommentExplorerProps {
  comments: CommentItem[];
  reportId: string;
}

export const CommentExplorer: React.FC<CommentExplorerProps> = ({ comments, reportId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [disagreementOnly, setDisagreementOnly] = useState(false);
  const [emojisOnly, setEmojisOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'vader_compound' | 'hf_confidence'>('likes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Sort comments
  const processedComments = useMemo(() => {
    let result = [...comments];

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.emojis.join('').includes(q)
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      result = result.filter((c) => c.vader.sentiment === sentimentFilter);
    }

    // Emotion filter
    if (emotionFilter !== 'all') {
      result = result.filter((c) => c.emotion.top_emotion.toLowerCase() === emotionFilter.toLowerCase());
    }

    // Disagreement filter
    if (disagreementOnly) {
      result = result.filter((c) => c.has_disagreement);
    }

    // Emojis only
    if (emojisOnly) {
      result = result.filter((c) => c.emojis.length > 0);
    }

    // Sort
    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortBy === 'likes') {
        valA = a.likes;
        valB = b.likes;
      } else if (sortBy === 'vader_compound') {
        valA = a.vader.compound;
        valB = b.vader.compound;
      } else if (sortBy === 'hf_confidence') {
        valA = a.huggingface.confidence;
        valB = b.huggingface.confidence;
      } else if (sortBy === 'date') {
        valA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        valB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [comments, searchTerm, sentimentFilter, emotionFilter, disagreementOnly, emojisOnly, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedComments.length / pageSize) || 1;
  const paginatedComments = processedComments.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCsv = () => {
    window.location.href = `/api/analysis/${reportId}/export`;
  };

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === 'positive') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    }
    if (sentiment === 'negative') {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm p-6 space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#24382D] dark:text-[#EAF5EC]">
            Comment Explorer
          </h3>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
            Search, filter and audit all {comments.length} analyzed comments with full model predictions
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8F1EA] hover:bg-[#d8e8dc] dark:bg-[#263D30] dark:hover:bg-[#2e4a3b] text-[#285943] dark:text-[#88C9A1] text-xs font-bold transition-all border border-[#A3BFA8]/40 dark:border-[#243E2E] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718579] dark:text-[#A5C2AC]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search comment text, author, or emojis..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-xl text-xs text-[#24382D] dark:text-[#EAF5EC] placeholder-[#718579] dark:placeholder-[#A5C2AC]/60 focus:outline-none focus:ring-2 focus:ring-[#285943] dark:focus:ring-[#88C9A1]"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F7FAF7] dark:bg-[#15271D] rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-xs">
            {(['all', 'positive', 'neutral', 'negative'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSentimentFilter(s);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  sentimentFilter === s
                    ? 'bg-[#285943] text-white shadow-sm dark:bg-[#88C9A1] dark:text-[#101D17]'
                    : 'text-[#718579] dark:text-[#A5C2AC] hover:text-[#24382D] dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 py-2.5 px-3 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-xl text-xs text-[#24382D] dark:text-[#EAF5EC] focus:outline-none"
            >
              <option value="likes">Sort by Likes</option>
              <option value="vader_compound">Sort by VADER Compound</option>
              <option value="hf_confidence">Sort by HF Confidence</option>
              <option value="date">Sort by Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] bg-[#F7FAF7] dark:bg-[#15271D] text-xs font-bold text-[#24382D] dark:text-[#EAF5EC] cursor-pointer"
              title={`Sorting ${sortOrder.toUpperCase()}`}
            >
              {sortOrder === 'desc' ? 'Desc' : 'Asc'}
            </button>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#24382D] dark:text-[#EAF5EC]">
            <input
              type="checkbox"
              checked={disagreementOnly}
              onChange={(e) => {
                setDisagreementOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded accent-[#285943] dark:accent-[#88C9A1]"
            />
            <span className="flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Show Model Disagreements Only</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[#24382D] dark:text-[#EAF5EC]">
            <input
              type="checkbox"
              checked={emojisOnly}
              onChange={(e) => {
                setEmojisOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded accent-[#285943] dark:accent-[#88C9A1]"
            />
            <span className="flex items-center gap-1 font-medium">
              <span>✨</span>
              <span>Contains Emojis</span>
            </span>
          </label>

          {/* Emotion filter select */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#718579] dark:text-[#A5C2AC]">Emotion:</span>
            <select
              value={emotionFilter}
              onChange={(e) => {
                setEmotionFilter(e.target.value);
                setPage(1);
              }}
              className="py-1 px-2.5 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-lg text-xs text-[#24382D] dark:text-[#EAF5EC] focus:outline-none"
            >
              <option value="all">All Emotions</option>
              <option value="joy">Joy</option>
              <option value="sadness">Sadness</option>
              <option value="anger">Anger</option>
              <option value="fear">Fear</option>
              <option value="surprise">Surprise</option>
              <option value="disgust">Disgust</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2ECE5] dark:border-[#243E2E]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7FAF7] dark:bg-[#15271D] border-b border-[#E2ECE5] dark:border-[#243E2E] text-[#718579] dark:text-[#A5C2AC]">
            <tr>
              <th className="py-3 px-4 font-bold">Comment Text</th>
              <th className="py-3 px-3 font-bold">Author & Likes</th>
              <th className="py-3 px-3 font-bold">VADER Lexicon</th>
              <th className="py-3 px-3 font-bold">HF RoBERTa</th>
              <th className="py-3 px-3 font-bold">Emotion</th>
              <th className="py-3 px-3 font-bold">Emojis</th>
              <th className="py-3 px-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2ECE5] dark:divide-[#243E2E]">
            {paginatedComments.length > 0 ? (
              paginatedComments.map((c) => {
                const isExpanded = expandedId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr className="hover:bg-[#F7FAF7] dark:hover:bg-[#15271D]/50 transition-colors">
                      {/* Text */}
                      <td className="py-3.5 px-4 font-medium text-[#24382D] dark:text-[#EAF5EC] max-w-xs">
                        <div className={isExpanded ? '' : 'truncate'}>
                          "{c.text}"
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-3 text-[#718579] dark:text-[#A5C2AC]">
                        <span className="font-semibold text-[#24382D] dark:text-[#EAF5EC] block">
                          @{c.author}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-rose-500">
                          <Heart className="w-3 h-3" />
                          <span>{c.likes.toLocaleString()}</span>
                        </span>
                      </td>

                      {/* VADER */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${getSentimentBadge(c.vader.sentiment)}`}>
                          {c.vader.sentiment}
                        </span>
                        <span className="block font-mono text-[10px] text-[#718579] dark:text-[#A5C2AC] mt-0.5">
                          c={c.vader.compound > 0 ? `+${c.vader.compound.toFixed(2)}` : c.vader.compound.toFixed(2)}
                        </span>
                      </td>

                      {/* Hugging Face */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${getSentimentBadge(c.huggingface.label)}`}>
                            {c.huggingface.label}
                          </span>
                          {c.has_disagreement && (
                            <span title="Models disagree on this comment">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <span className="block font-mono text-[10px] text-[#718579] dark:text-[#A5C2AC] mt-0.5">
                          conf={(c.huggingface.confidence * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Emotion */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold capitalize text-[#285943] dark:text-[#88C9A1]">
                          {c.emotion.top_emotion}
                        </span>
                        <span className="block text-[10px] text-[#718579] dark:text-[#A5C2AC]">
                          {(c.emotion.confidence * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Emojis */}
                      <td className="py-3.5 px-3 text-base">
                        {c.emojis.length > 0 ? (
                          <span>{c.emojis.join(' ')}</span>
                        ) : (
                          <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC] italic">None</span>
                        )}
                      </td>

                      {/* Expand Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                          className="p-1 rounded text-[#718579] dark:text-[#A5C2AC] hover:bg-[#E8F1EA] dark:hover:bg-[#263D30] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand full details'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#F7FAF7] dark:bg-[#15271D]">
                        <td colSpan={7} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                              <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">
                                VADER Scores Detail
                              </span>
                              <div className="space-y-0.5 text-[11px] font-mono text-[#718579] dark:text-[#A5C2AC]">
                                <div>Pos: {c.vader.pos} · Neg: {c.vader.neg} · Neu: {c.vader.neu}</div>
                                <div>Compound: {c.vader.compound}</div>
                              </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                              <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">
                                Hugging Face Metadata
                              </span>
                              <div className="space-y-0.5 text-[11px] text-[#718579] dark:text-[#A5C2AC]">
                                <div>Model: {c.huggingface.model_name}</div>
                                <div>Confidence: {(c.huggingface.confidence * 100).toFixed(2)}%</div>
                              </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-[#1C3025] rounded-xl border border-[#E2ECE5] dark:border-[#263D30]">
                              <span className="font-bold text-[#285943] dark:text-[#88C9A1] block mb-1">
                                Full Emotion Probabilities
                              </span>
                              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-[#718579] dark:text-[#A5C2AC]">
                                {Object.entries(c.emotion.breakdown).map(([e, score]) => (
                                  <div key={e}>
                                    {e}: {(score * 100).toFixed(0)}%
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#718579] dark:text-[#A5C2AC]">
                  No comments matched your current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#718579] dark:text-[#A5C2AC] pt-2">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="py-1 px-2 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-lg text-xs text-[#24382D] dark:text-[#EAF5EC]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>of {processedComments.length} filtered comments</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-[#E2ECE5] dark:border-[#243E2E] disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-[#24382D] dark:text-[#EAF5EC]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-[#E2ECE5] dark:border-[#243E2E] disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
