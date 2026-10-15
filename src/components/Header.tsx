import React from 'react';
import { Sun, Moon, Sparkles, RefreshCw, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  onRefresh: () => void;
  isAnalyzing: boolean;
  activeSectionTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  collapsed,
  setCollapsed,
  onRefresh,
  isAnalyzing,
  activeSectionTitle,
}) => {
  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-[#15271D]/80 backdrop-blur-md border-b border-[#E2ECE5] dark:border-[#243E2E] px-6 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-[#718579] hover:text-[#24382D] dark:text-[#A5C2AC] dark:hover:text-[#EAF5EC] hover:bg-[#E8F1EA] dark:hover:bg-[#1C3025] transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#24382D] dark:text-[#EAF5EC] tracking-tight">
            {activeSectionTitle}
          </h1>
          <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
            TikTok Video Sentiment & Emotion Intelligence Hub
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh / Re-run */}
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="p-2.5 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-[#24382D] dark:text-[#EAF5EC] hover:bg-[#E8F1EA] dark:hover:bg-[#1C3025] transition-colors disabled:opacity-50 cursor-pointer"
          title="Re-run analysis"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-[#24382D] dark:text-[#EAF5EC] hover:bg-[#E8F1EA] dark:hover:bg-[#1C3025] transition-colors cursor-pointer"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#285943]" />
          )}
        </button>
      </div>
    </header>
  );
};
