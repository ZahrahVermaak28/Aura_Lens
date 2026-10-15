import React, { useEffect, useState } from 'react';
import { History, ArrowRight, Calendar, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySectionProps {
  onLoadAnalysis: (id: string) => void;
  activeId: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onLoadAnalysis, activeId }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analysis/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#285943] text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#24382D] dark:text-[#EAF5EC]">
              Analysis History (SQLite Archive)
            </h2>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mt-1">
            Reopen previous TikTok video sentiment batches with a single click
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="p-2 rounded-lg border border-[#E2ECE5] dark:border-[#243E2E] hover:bg-[#E8F1EA] dark:hover:bg-[#263D30] text-[#718579] dark:text-[#A5C2AC] cursor-pointer"
          title="Refresh history"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#718579] dark:text-[#A5C2AC]">
          Loading analysis history...
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#718579] dark:text-[#A5C2AC]">
          No past analyses found yet. Run an analysis above to populate this archive.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => {
            const isCurrentlyActive = item.id === activeId;
            const dateStr = new Date(item.analysed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-[#285943] dark:border-[#88C9A1] bg-[#E8F1EA]/50 dark:bg-[#263D30]/60 ring-2 ring-[#285943]/20 dark:ring-[#88C9A1]/20'
                    : 'border-[#E2ECE5] dark:border-[#243E2E] bg-[#F7FAF7] dark:bg-[#15271D] hover:border-[#A3BFA8]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#285943] dark:text-[#88C9A1]">
                      @{item.author_username}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#1C3025] text-[#718579] dark:text-[#A5C2AC] border border-[#E2ECE5] dark:border-[#263D30]">
                      {item.data_source}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#24382D] dark:text-[#EAF5EC] line-clamp-2">
                    {item.caption}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#718579] dark:text-[#A5C2AC] pt-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.total_comments} comments</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] text-[#718579] dark:text-[#A5C2AC] block">Primary Sentiment</span>
                    <span className={`font-bold capitalize ${
                      item.primary_sentiment === 'positive'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : item.primary_sentiment === 'negative'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-[#718579] dark:text-[#A5C2AC]'
                    }`}>
                      {item.primary_sentiment} ({item.positive_pct}%)
                    </span>
                  </div>

                  <button
                    onClick={() => onLoadAnalysis(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#285943] hover:bg-[#1f4534] dark:bg-[#88C9A1] dark:hover:bg-[#72b78d] text-white dark:text-[#101D17] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isCurrentlyActive ? 'Current' : 'Reopen'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
