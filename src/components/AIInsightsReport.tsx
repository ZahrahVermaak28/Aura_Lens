import React from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Smile,
  GitCompare,
  TrendingUp,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { OverallSummary, VideoMetadata } from '../types';
import { AuraLensIcon } from './AuraLensLogo';

interface AIInsightsReportProps {
  summary: OverallSummary;
  videoInfo: VideoMetadata;
}

export const AIInsightsReport: React.FC<AIInsightsReportProps> = ({ summary, videoInfo }) => {
  const handlePrint = () => {
    window.print();
  };

  const { insights } = summary;

  return (
    <div className="space-y-6">
      {/* Header and Print action */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <AuraLensIcon sizePx={32} />
            <h2 className="text-base font-extrabold text-[#24382D] dark:text-[#EAF5EC]">
              AuraLens Executive Sentiment Intelligence Report
            </h2>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mt-1">
            Synthesized dual-engine intelligence grounded strictly in calculated statistics for @{videoInfo.author_username}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8F1EA] hover:bg-[#d8e8dc] dark:bg-[#263D30] dark:hover:bg-[#2e4a3b] text-[#285943] dark:text-[#88C9A1] text-xs font-bold transition-all border border-[#A3BFA8]/40 dark:border-[#243E2E] cursor-pointer print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Overall Audience Reaction */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">1. Overall Audience Reaction</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.overall_reaction}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Calculated from: VADER ({summary.vader_distribution.positive_pct}% Pos) vs RoBERTa ({summary.hf_distribution.positive_pct}% Pos)
          </div>
        </div>

        {/* 2. Common Emotional Reactions */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-blue-800 dark:text-blue-400">
            <Sparkles className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">2. Common Emotional Reactions</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.emotional_reactions}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Evaluated using DistilRoBERTa 7-class emotion classifier
          </div>
        </div>

        {/* 3. Emoji Behaviour */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400">
            <Smile className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">3. Emoji Behaviour & Tone</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.emoji_behavior}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Identified via Python emoji library with contextual demojization
          </div>
        </div>

        {/* 4. Model Comparison */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-purple-800 dark:text-purple-400">
            <GitCompare className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">4. VADER vs Transformer Comparison</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.model_comparison}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Direct concordance: {summary.agreement_rate}% ({summary.disagreement_count} divergent classifications)
          </div>
        </div>

        {/* 5. Notable Findings */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">5. Notable Findings</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.notable_findings}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Correlated across comment lengths, emoji usage, and engagement
          </div>
        </div>

        {/* 6. Limitations */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold">6. Academic & Empirical Limitations</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#24382D] dark:text-[#EAF5EC]">
            {insights.limitations}
          </p>
          <div className="pt-2 text-[11px] text-[#718579] dark:text-[#A5C2AC] border-t border-[#E2ECE5] dark:border-[#243E2E]">
            Adheres to academic standards: strictly bounded to retrieved sample size
          </div>
        </div>
      </div>
    </div>
  );
};
