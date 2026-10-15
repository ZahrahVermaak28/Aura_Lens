import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, ArrowUpRight, Cpu, Sparkles } from 'lucide-react';
import { OverallSummary } from '../types';

interface MetricCardsProps {
  summary: OverallSummary;
  selectedEngine: 'vader' | 'huggingface';
  setSelectedEngine: (engine: 'vader' | 'huggingface') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summary,
  selectedEngine,
  setSelectedEngine,
}) => {
  const currentDist =
    selectedEngine === 'vader' ? summary.vader_distribution : summary.hf_distribution;

  return (
    <div className="space-y-4">
      {/* Engine Switcher bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#E8F1EA] dark:bg-[#15271D] p-2.5 rounded-xl border border-[#A3BFA8]/30 dark:border-[#243E2E]">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-[#285943] dark:text-[#88C9A1]">
          <span>Metric Calculation Engine:</span>
          <span className="font-normal text-[#718579] dark:text-[#A5C2AC]">
            {selectedEngine === 'vader'
              ? 'VADER Rule-Based Lexicon (Compound scores)'
              : 'Hugging Face RoBERTa Transformer (Neural contextual embeddings)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1C3025] rounded-lg border border-[#E2ECE5] dark:border-[#263D30]">
          <button
            onClick={() => setSelectedEngine('vader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedEngine === 'vader'
                ? 'bg-[#285943] text-white shadow-sm dark:bg-[#88C9A1] dark:text-[#101D17]'
                : 'text-[#718579] dark:text-[#A5C2AC] hover:text-[#24382D] dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>VADER</span>
          </button>
          <button
            onClick={() => setSelectedEngine('huggingface')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedEngine === 'huggingface'
                ? 'bg-[#285943] text-white shadow-sm dark:bg-[#88C9A1] dark:text-[#101D17]'
                : 'text-[#718579] dark:text-[#A5C2AC] hover:text-[#24382D] dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hugging Face</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Comments */}
        <div className="bg-white dark:bg-[#1C3025] p-5 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm relative overflow-hidden group hover:border-[#A3BFA8] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718579] dark:text-[#A5C2AC]">
              Total Analysed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F1EA] dark:bg-[#263D30] flex items-center justify-center text-[#285943] dark:text-[#88C9A1]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-[#24382D] dark:text-[#EAF5EC]">
              {summary.total_comments}
            </span>
            <span className="text-xs font-semibold text-[#718579] dark:text-[#A5C2AC]">comments</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E] text-[11px] text-[#718579] dark:text-[#A5C2AC]">
            Cleaned & processed across all algorithms
          </div>
        </div>

        {/* Positive Sentiment */}
        <div className="bg-white dark:bg-[#1C3025] p-5 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Positive Sentiment
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
              {currentDist.positive_pct}%
            </span>
            <span className="text-xs font-semibold text-[#718579] dark:text-[#A5C2AC]">
              ({currentDist.positive} of {summary.total_comments})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between text-[11px] text-[#718579] dark:text-[#A5C2AC]">
            <span>Threshold: {selectedEngine === 'vader' ? 'Compound ≥ 0.05' : 'Softmax > 0.60'}</span>
            <span className="text-emerald-600 font-semibold">Affinity</span>
          </div>
        </div>

        {/* Negative Sentiment */}
        <div className="bg-white dark:bg-[#1C3025] p-5 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Negative Sentiment
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ThumbsDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-rose-700 dark:text-rose-400">
              {currentDist.negative_pct}%
            </span>
            <span className="text-xs font-semibold text-[#718579] dark:text-[#A5C2AC]">
              ({currentDist.negative} of {summary.total_comments})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between text-[11px] text-[#718579] dark:text-[#A5C2AC]">
            <span>Threshold: {selectedEngine === 'vader' ? 'Compound ≤ -0.05' : 'Softmax > 0.60'}</span>
            <span className="text-rose-600 font-semibold">Criticism</span>
          </div>
        </div>

        {/* Neutral Sentiment */}
        <div className="bg-white dark:bg-[#1C3025] p-5 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm relative overflow-hidden group hover:border-[#A3BFA8] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718579] dark:text-[#A5C2AC]">
              Neutral Sentiment
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F1EA] dark:bg-[#263D30] flex items-center justify-center text-[#718579] dark:text-[#A5C2AC]">
              <Minus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-[#24382D] dark:text-[#EAF5EC]">
              {currentDist.neutral_pct}%
            </span>
            <span className="text-xs font-semibold text-[#718579] dark:text-[#A5C2AC]">
              ({currentDist.neutral} of {summary.total_comments})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between text-[11px] text-[#718579] dark:text-[#A5C2AC]">
            <span>Inquiries, questions & facts</span>
            <span className="font-semibold">Informational</span>
          </div>
        </div>
      </div>
    </div>
  );
};
