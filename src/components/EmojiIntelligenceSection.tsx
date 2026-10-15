import React, { useState } from 'react';
import { Smile, Sparkles, MessageCircle, Heart, BarChart3, AlertCircle } from 'lucide-react';
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
import { OverallSummary } from '../types';

interface EmojiIntelligenceSectionProps {
  summary: OverallSummary;
  darkMode: boolean;
}

export const EmojiIntelligenceSection: React.FC<EmojiIntelligenceSectionProps> = ({
  summary,
  darkMode,
}) => {
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  // Emotion breakdown data
  const emotionData = Object.entries(summary.emotion_distribution).map(([emo, count]) => ({
    emotion: emo.charAt(0).toUpperCase() + emo.slice(1),
    count: count,
  }));

  // Top emojis for frequency chart
  const top10Emojis = summary.top_emojis.slice(0, 10);

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1C3025' : '#FFFFFF',
    borderColor: darkMode ? '#263D30' : '#E2ECE5',
    color: darkMode ? '#EAF5EC' : '#24382D',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '12px',
  };

  const getEmojiColor = (sentiment: string) => {
    if (sentiment === 'positive') return darkMode ? '#88C9A1' : '#285943';
    if (sentiment === 'negative') return '#DC2626';
    return '#A3BFA8';
  };

  const activeEmojiDetail = summary.top_emojis.find((e) => e.emoji === hoveredEmoji) || summary.top_emojis[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E8F1EA] dark:bg-[#15271D] p-6 rounded-2xl border border-[#A3BFA8]/40 dark:border-[#243E2E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#285943] text-white flex items-center justify-center text-2xl shadow-md shrink-0">
            🌿
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#285943] dark:text-[#88C9A1]">
              Emoji & Contextual Emotion Intelligence
            </h2>
            <p className="text-xs text-[#24382D] dark:text-[#A5C2AC]">
              Decoding TikTok visual language via Python emoji heuristics & subword emotion transformers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C3025] border border-[#E2ECE5] dark:border-[#263D30]">
            <span className="text-[#718579] dark:text-[#A5C2AC] block text-[11px]">Total Emojis Detected</span>
            <span className="font-black text-[#285943] dark:text-[#88C9A1] text-base">
              {summary.top_emojis.reduce((acc, curr) => acc + curr.count, 0)} symbols
            </span>
          </div>
        </div>
      </div>

      {/* Row: Interactive Emoji Cloud + Context Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Emoji Cloud */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
                Interactive Emoji Cloud
              </h3>
              <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">
                Hover an emoji to inspect audience sentiment
              </span>
            </div>
            <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-6">
              Visual prominence scaled dynamically by frequency of occurrence in verified comments
            </p>

            {/* Cloud Display */}
            {summary.top_emojis.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] min-h-[220px]">
                {summary.top_emojis.map((item) => {
                  // Size scaling between 24px and 56px based on count
                  const maxCount = Math.max(...summary.top_emojis.map((e) => e.count), 1);
                  const scaleFactor = Math.max(0.7, item.count / maxCount);
                  const fontSizePx = Math.round(22 + scaleFactor * 32);

                  const isHovered = hoveredEmoji === item.emoji;

                  return (
                    <button
                      key={item.emoji}
                      onMouseEnter={() => setHoveredEmoji(item.emoji)}
                      onClick={() => setHoveredEmoji(item.emoji)}
                      style={{ fontSize: `${fontSizePx}px` }}
                      className={`transition-all duration-200 transform cursor-pointer select-none p-1 rounded-xl ${
                        isHovered
                          ? 'scale-135 bg-[#DCEEE1] dark:bg-[#263D30] shadow-md z-10'
                          : 'hover:scale-120'
                      }`}
                      title={`${item.emoji}: ${item.count} occurrences`}
                    >
                      {item.emoji}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#718579] dark:text-[#A5C2AC]">
                No emojis were present in this comments batch.
              </div>
            )}
          </div>

          {/* Active Emoji Inspect Strip */}
          {activeEmojiDetail && (
            <div className="mt-6 pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeEmojiDetail.emoji}</span>
                <div>
                  <span className="font-extrabold text-[#24382D] dark:text-[#EAF5EC] block">
                    Used {activeEmojiDetail.count} time{activeEmojiDetail.count > 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">
                    Dominant Sentiment:{' '}
                    <strong className="capitalize text-[#285943] dark:text-[#88C9A1]">
                      {activeEmojiDetail.sentiment}
                    </strong>{' '}
                    · Associated Emotion: <strong className="capitalize">{activeEmojiDetail.associated_emotion}</strong>
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#718579] dark:text-[#A5C2AC] italic max-w-xs">
                Contextual note: Emojis are transformed into text tokens prior to emotion modeling to capture nuanced tone.
              </div>
            </div>
          )}
        </div>

        {/* Emoji Context Comparison Card */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC] mb-1">
              Emoji Context Comparison
            </h3>
            <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
              Comparing comments containing emojis vs plain text responses
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#24382D] dark:text-[#EAF5EC] flex items-center gap-1.5">
                    <span>✨</span> With Emojis
                  </span>
                  <span className="font-mono text-[#718579] dark:text-[#A5C2AC]">
                    {summary.emoji_comparison.with_emoji_count} comments
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {summary.emoji_comparison.with_emoji_pos_pct}%
                  </span>
                  <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">Positivity rate</span>
                </div>
                <div className="w-full bg-[#E8F1EA] dark:bg-[#263D30] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 dark:bg-[#88C9A1] h-1.5 rounded-full"
                    style={{ width: `${summary.emoji_comparison.with_emoji_pos_pct}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#24382D] dark:text-[#EAF5EC] flex items-center gap-1.5">
                    <span>📝</span> Without Emojis
                  </span>
                  <span className="font-mono text-[#718579] dark:text-[#A5C2AC]">
                    {summary.emoji_comparison.without_emoji_count} comments
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-[#285943] dark:text-[#A5C2AC]">
                    {summary.emoji_comparison.without_emoji_pos_pct}%
                  </span>
                  <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">Positivity rate</span>
                </div>
                <div className="w-full bg-[#E8F1EA] dark:bg-[#263D30] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#285943] dark:bg-[#88C9A1] h-1.5 rounded-full"
                    style={{ width: `${summary.emoji_comparison.without_emoji_pos_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] text-[11px] text-[#718579] dark:text-[#A5C2AC]">
            💡 TikTok viewers who comment with emojis exhibit significantly higher enthusiasm and affinity than text-only commenters.
          </div>
        </div>
      </div>

      {/* Row: Emotion Breakdown Bar Chart + Top 10 Emoji Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Breakdown */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              Emotion Distribution (RoBERTa Emotion Model)
            </h3>
            <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">7 Discrete States</span>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Classified across Joy, Sadness, Anger, Fear, Surprise, Disgust, and Neutral
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                <XAxis type="number" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} />
                <YAxis dataKey="emotion" type="category" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} width={70} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={darkMode ? '#88C9A1' : '#285943'} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emoji Frequency Horizontal Chart */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              Top 10 Emoji Frequency
            </h3>
            <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">Ranked by Count</span>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Number of times each icon appeared in verified comment texts
          </p>

          <div className="h-64">
            {top10Emojis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={top10Emojis}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }} />
                  <YAxis dataKey="emoji" type="category" tick={{ fontSize: 14 }} width={45} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={darkMode ? '#76A98A' : '#A3BFA8'} radius={[0, 4, 4, 0]}>
                    {top10Emojis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getEmojiColor(entry.sentiment)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#718579] dark:text-[#A5C2AC]">
                No emojis to rank in this dataset.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
