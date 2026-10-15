import React, { useState } from 'react';
import { Settings, Key, Cpu, Sparkles, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Platform & Methodology Header */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#285943] text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#24382D] dark:text-[#EAF5EC]">
              AuraLens Methodology & Technical Architecture
            </h2>
            <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
              AuraLens Dual-Engine Sentiment Analysis — Technical specification & model documentation
            </p>
          </div>
        </div>
      </div>

      {/* Model Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VADER Card */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#285943] dark:text-[#88C9A1]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold">1. VADER Sentiment Analysis</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#718579] dark:text-[#A5C2AC]">
            VADER relies on human-curated valence dictionaries coupled with five rule-based heuristics. It excels in parsing microtexts with heavy punctuation ("!!!"), capitalization ("LOVE THIS"), and negation flip words ("not bad").
          </p>
          <ul className="text-xs space-y-1.5 text-[#24382D] dark:text-[#EAF5EC] list-disc list-inside">
            <li>Zero training or inference overhead (O(N) runtime)</li>
            <li>Normalized compound score: [-1.0, +1.0]</li>
            <li>Thresholds: Positive (&ge; 0.05), Neutral (-0.05 to 0.05), Negative (&le; -0.05)</li>
          </ul>
        </div>

        {/* Hugging Face Card */}
        <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-sm font-bold">2. Hugging Face RoBERTa Transformer</h3>
          </div>
          <p className="text-xs leading-relaxed text-[#718579] dark:text-[#A5C2AC]">
            Pretrained model <code className="text-[11px] font-mono bg-[#E8F1EA] dark:bg-[#263D30] px-1 py-0.5 rounded">cardiffnlp/twitter-roberta-base-sentiment-latest</code> uses deep self-attention to process bidirectional contextual word embeddings.
          </p>
          <ul className="text-xs space-y-1.5 text-[#24382D] dark:text-[#EAF5EC] list-disc list-inside">
            <li>125M parameters trained on 124M social microtexts</li>
            <li>Understands complex context, idioms, and subtle shifts</li>
            <li>Provides Softmax class probabilities and confidence scores</li>
          </ul>
        </div>
      </div>

      {/* API Credential Configuration */}
      <div className="bg-white dark:bg-[#1C3025] p-6 rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#24382D] dark:text-[#EAF5EC]">
          <Key className="w-5 h-5 text-[#285943] dark:text-[#88C9A1]" />
          <h3 className="text-sm font-bold">TikTok Data Provider Credentials</h3>
        </div>
        <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
          TikTok's official Research API or authorized third-party data providers require API authentication to stream public comments. If not provided, AuraLens operates securely in verified demo or CSV mode without making fake calls.
        </p>

        <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-xl">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter TIKTOK_API_KEY (optional)"
            className="flex-1 px-4 py-2.5 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-xl text-xs text-[#24382D] dark:text-[#EAF5EC] focus:outline-none focus:ring-2 focus:ring-[#285943] dark:focus:ring-[#88C9A1]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#285943] hover:bg-[#1f4534] dark:bg-[#88C9A1] dark:hover:bg-[#72b78d] text-white dark:text-[#101D17] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{saved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
