import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { OverallSummary } from '../types';
import { Calendar, GitCompare, Info } from 'lucide-react';

interface OverviewVisualsProps {
  summary: OverallSummary;
  darkMode: boolean;
}

export const OverviewVisuals: React.FC<OverviewVisualsProps> = ({ summary, darkMode }) => {
  // Chart Colors based on theme
  const positiveColor = darkMode ? '#88C9A1' : '#285943';
  const neutralColor = darkMode ? '#A5C2AC' : '#A3BFA8';
  const negativeColor = darkMode ? '#F87171' : '#DC2626';

  const donutData = [
    { name: 'Positive', value: summary.vader_distribution.positive, color: positiveColor },
    { name: 'Neutral', value: summary.vader_distribution.neutral, color: neutralColor },
    { name: 'Negative', value: summary.vader_distribution.negative, color: negativeColor },
  ];

  const comparisonData = [
    {
      category: 'Positive',
      VADER: summary.vader_distribution.positive,
      'Hugging Face': summary.hf_distribution.positive,
    },
    {
      category: 'Neutral',
      VADER: summary.vader_distribution.neutral,
      'Hugging Face': summary.hf_distribution.neutral,
    },
    {
      category: 'Negative',
      VADER: summary.vader_distribution.negative,
      'Hugging Face': summary.hf_distribution.negative,
    },
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Donut Chart */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              Sentiment Proportions
            </h3>
            <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">VADER Lexicon</span>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Distribution of compound valence across comments
          </p>
        </div>

        <div className="h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-[#24382D] dark:text-[#EAF5EC]">
              {summary.total_comments}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#718579] dark:text-[#A5C2AC]">
              Comments
            </span>
          </div>
        </div>

        {/* Legend with percentages */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] text-center text-xs">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#88C9A1]" />
              <span>Pos</span>
            </div>
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">
              {summary.vader_distribution.positive_pct}%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 text-[#718579] dark:text-[#A5C2AC] font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#A3BFA8]" />
              <span>Neu</span>
            </div>
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">
              {summary.vader_distribution.neutral_pct}%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Neg</span>
            </div>
            <span className="font-bold text-[#24382D] dark:text-[#EAF5EC]">
              {summary.vader_distribution.negative_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart 2: Timeline Line Chart */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              Sentiment Timeline
            </h3>
            <span className="text-xs text-[#718579] dark:text-[#A5C2AC] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Daily Trend</span>
            </span>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Volume of positive vs negative feedback over time
          </p>
        </div>

        <div className="h-64">
          {summary.timeline && summary.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }}
                  tickLine={false}
                  axisLine={{ stroke: darkMode ? '#263D30' : '#E2ECE5' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }}
                  tickLine={false}
                  axisLine={{ stroke: darkMode ? '#263D30' : '#E2ECE5' }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke={positiveColor}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke={negativeColor}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#718579] dark:text-[#A5C2AC]">
              <Info className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-xs font-medium">Timestamps unavailable from provider</p>
              <p className="text-[11px] opacity-75 mt-1">
                Time-based trend was withheld to avoid fabricating artificial trends.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between text-xs text-[#718579] dark:text-[#A5C2AC]">
          <span>Tracked data points: {summary.timeline.length} days</span>
          <span className="font-semibold text-[#285943] dark:text-[#88C9A1]">Comment Timestamps</span>
        </div>
      </div>

      {/* Chart 3: Grouped Bar Chart VADER vs Hugging Face */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
              VADER vs Hugging Face
            </h3>
            <span className="text-xs text-[#285943] dark:text-[#88C9A1] font-semibold flex items-center gap-1">
              <GitCompare className="w-3 h-3" />
              <span>{summary.agreement_rate}% Agreement</span>
            </span>
          </div>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC] mb-4">
            Side-by-side classification volume across both engines
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#243E2E' : '#E8F1EA'} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#263D30' : '#E2ECE5' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: darkMode ? '#A5C2AC' : '#718579' }}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#263D30' : '#E2ECE5' }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="VADER" fill={darkMode ? '#88C9A1' : '#285943'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hugging Face" fill={darkMode ? '#718579' : '#A3BFA8'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between text-xs text-[#718579] dark:text-[#A5C2AC]">
          <span>Disagreements: {summary.disagreement_count} comments</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {summary.agreement_rate >= 80 ? 'High Concordance' : 'Contextual Divergence'}
          </span>
        </div>
      </div>
    </div>
  );
};
