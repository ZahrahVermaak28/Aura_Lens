import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, HelpCircle, Layers, Award } from 'lucide-react';
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

interface HuggingFaceSectionProps {
  summary: OverallSummary;
  comments: CommentItem[];
  darkMode: boolean;
}

export const HuggingFaceSection: React.FC<HuggingFaceSectionProps> = ({
  summary,
  comments,
  darkMode,
}) => {
  const disagreementComments = comments.filter((c) => c.has_disagreement);

  // Confidence distribution buckets
  const confBuckets = [
    { range: '60% - 70%', count: comments.filter(c => c.huggingface.confidence >= 0.60 && c.huggingface.confidence < 0.70).length },
    { range: '70% - 80%', count: comments.filter(c => c.huggingface.confidence >= 0.70 && c.huggingface.confidence < 0.80).length },
    { range: '80% - 90%', count: comments.filter(c => c.huggingface.confidence >= 0.80 && c.huggingface.confidence < 0.90).length },
    { range: '90% - 100%', count: comments.filter(c => c.huggingface.confidence >= 0.90).length },
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
      {/* Model Documentation Card */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2ECE5] dark:border-[#243E2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#285943] text-white flex items-center justify-center shrink-0 shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#24382D] dark:text-[#EAF5EC]">
                  Twitter-RoBERTa-base (Sentiment Latest)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F1EA] dark:bg-[#263D30] text-[#285943] dark:text-[#88C9A1]">
                  125M Parameters
                </span>
              </div>
              <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
                cardiffnlp/twitter-roberta-base-sentiment-latest · Fine-tuned on ~124M social microtexts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC] block">Avg Model Confidence</span>
              <span className="text-base font-black text-[#285943] dark:text-[#88C9A1]">
                {(summary.confidence_avg * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">Architecture</span>
            <p className="text-[#718579] dark:text-[#A5C2AC]">
              RoBERTa (Robustly Optimized BERT Approach) using masked language modeling with bidirectional transformer self-attention layers.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">Social Vocabulary</span>
            <p className="text-[#718579] dark:text-[#A5C2AC]">
              Trained directly on social media posts, making it exceptionally resilient to internet slang, abbreviations, hashtags, and informal syntax.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">Output Head</span>
            <p className="text-[#718579] dark:text-[#A5C2AC]">
              3-Class Softmax classification head yielding probability distributions over Positive, Neutral, and Negative categories.
            </p>
          </div>
        </div>
      </div>

      {/* Model Agreement vs Disagreement Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agreement Meter */}
        <div className="bg-[#E8F1EA] dark:bg-[#15271D] p-6 rounded-2xl border border-[#A3BFA8]/40 dark:border-[#243E2E] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#285943] dark:text-[#88C9A1] uppercase tracking-wider">
                Cross-Model Concordance
              </span>
              <Award className="w-4 h-4 text-[#285943] dark:text-[#88C9A1]" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-[#285943] dark:text-[#88C9A1]">
                {summary.agreement_rate}%
              </span>
              <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">identical label</span>
            </div>
            <p className="text-xs text-[#24382D] dark:text-[#A5C2AC] leading-relaxed">
              VADER (lexicon) and Hugging Face (RoBERTa transformer) agreed on{' '}
              {summary.total_comments - summary.disagreement_count} out of {summary.total_comments} comments.
            </p>
          </div>

          <div className="pt-4 border-t border-[#A3BFA8]/40 dark:border-[#243E2E] mt-4">
            <div className="w-full bg-white dark:bg-[#263D30] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#285943] dark:bg-[#88C9A1] h-2.5 rounded-full"
                style={{ width: `${summary.agreement_rate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#718579] dark:text-[#A5C2AC] mt-1.5">
              <span>{summary.disagreement_count} Disagreements</span>
              <span>{summary.total_comments - summary.disagreement_count} Agreements</span>
            </div>
          </div>
        </div>

        {/* Confidence Spread Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
                Hugging Face Prediction Confidence Spread
              </h3>
              <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
                Distribution of Softmax probability scores across all processed comments
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#285943] dark:text-[#88C9A1]">
              Mean: {(summary.confidence_avg * 100).toFixed(1)}%
            </span>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={darkMode ? '#88C9A1' : '#285943'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Disagreement Deep-Dive Section */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Model Disagreement Deep-Dive ({disagreementComments.length} Divergent Cases)</span>
            </h3>
            <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
              Real examples where rule-based VADER and contextual RoBERTa produced different classifications
            </p>
          </div>
          <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">
            Rate: {((disagreementComments.length / Math.max(summary.total_comments, 1)) * 100).toFixed(1)}%
          </span>
        </div>

        {disagreementComments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disagreementComments.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] space-y-3"
              >
                <div className="text-xs font-semibold text-[#24382D] dark:text-[#EAF5EC]">
                  "{c.text}"
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E2ECE5] dark:border-[#243E2E]">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#1C3025] border border-[#E2ECE5] dark:border-[#263D30]">
                    <span className="text-[10px] uppercase font-bold text-[#718579] dark:text-[#A5C2AC] block">
                      VADER Lexicon
                    </span>
                    <span className="font-extrabold capitalize text-emerald-700 dark:text-emerald-400">
                      {c.vader.sentiment} ({c.vader.compound > 0 ? `+${c.vader.compound.toFixed(2)}` : c.vader.compound.toFixed(2)})
                    </span>
                    <span className="text-[10px] text-[#718579] dark:text-[#A5C2AC] block mt-1">
                      Based on keyword valence sum
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#1C3025] border border-[#E2ECE5] dark:border-[#263D30]">
                    <span className="text-[10px] uppercase font-bold text-[#718579] dark:text-[#A5C2AC] block">
                      HF RoBERTa
                    </span>
                    <span className="font-extrabold capitalize text-blue-700 dark:text-blue-400">
                      {c.huggingface.label} ({(c.huggingface.confidence * 100).toFixed(0)}%)
                    </span>
                    <span className="text-[10px] text-[#718579] dark:text-[#A5C2AC] block mt-1">
                      Contextual subword attention
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#718579] dark:text-[#A5C2AC] italic">
                  💡 Disagreement insight: VADER weights individual dictionary terms (like slang or punctuation), whereas RoBERTa reads surrounding context (such as skepticism, questions, or contrasting prepositions).
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#718579] dark:text-[#A5C2AC]">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold">Full Concordance on this sample!</p>
            <p className="text-[11px] mt-1">Both VADER and RoBERTa classified every comment into matching categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};
