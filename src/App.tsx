import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoInputBar } from './components/VideoInputBar';
import { VideoInfoCard } from './components/VideoInfoCard';
import { MetricCards } from './components/MetricCards';
import { OverviewVisuals } from './components/OverviewVisuals';
import { VaderSection } from './components/VaderSection';
import { HuggingFaceSection } from './components/HuggingFaceSection';
import { EmojiIntelligenceSection } from './components/EmojiIntelligenceSection';
import { CommentExplorer } from './components/CommentExplorer';
import { AIInsightsReport } from './components/AIInsightsReport';
import { HistorySection } from './components/HistorySection';
import { SettingsSection } from './components/SettingsSection';
import { CsvUploadModal } from './components/CsvUploadModal';
import { AnalysisReport } from './types';
import { getSampleReport } from './data/sampleReports';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  // Theme state: defaults strictly to false (Light Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('auralens_theme');
    return saved === 'dark';
  });

  // Sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Selected engine for metric cards
  const [selectedEngine, setSelectedEngine] = useState<'vader' | 'huggingface'>('vader');

  // Analysis state
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // CSV Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('auralens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('auralens_theme', 'light');
    }
  }, [darkMode]);

  // Load initial demo analysis on startup
  useEffect(() => {
    handleAnalyze(
      'https://www.tiktok.com/@sarah.botanicals/video/739182390142981023',
      true,
      'lifestyle'
    );
  }, []);

  const handleAnalyze = async (
    url: string,
    demoMode: boolean = true,
    sampleDataset: string = 'lifestyle'
  ) => {
    const datasetKey =
      sampleDataset === 'tech' || url.includes('mkbhd') ? 'tech' : 'lifestyle';

    try {
      setIsAnalyzing(true);
      setError(null);
      setProgressStep(0);

      // Sequential step feedback for realistic analysis progression
      const stepInterval = setInterval(() => {
        setProgressStep((prev) => (prev < 5 ? prev + 1 : prev));
      }, 250);

      try {
        const res = await fetch('/api/analyse/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            demo_mode: demoMode,
            sample_dataset: sampleDataset,
          }),
        });

        clearInterval(stepInterval);
        setProgressStep(6);

        if (res.ok) {
          const data: AnalysisReport = await res.json();
          setReport(data);
          return;
        }

        // If backend returns non-ok (e.g. 404 in published static deployment)
        if (demoMode || url.includes('sarah.botanicals') || url.includes('mkbhd')) {
          setReport(getSampleReport(datasetKey));
          return;
        }

        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.detail ||
          'Live TikTok comment retrieval requires server-side API credentials. Please select a sample dataset (Skincare Lifestyle or Tech Hardware) or upload an exported comments CSV.'
        );
      } catch (fetchErr: any) {
        clearInterval(stepInterval);
        setProgressStep(6);

        // Network error / 404 in published static deployment
        if (demoMode || url.includes('sarah.botanicals') || url.includes('mkbhd')) {
          setReport(getSampleReport(datasetKey));
          return;
        }

        throw new Error(
          fetchErr.message && !fetchErr.message.includes('fetch')
            ? fetchErr.message
            : 'Live TikTok comment retrieval is unavailable in the published static deployment because the backend server is not reachable. You can test live comment retrieval in Preview, explore the verified Sample Datasets, or upload an exported comments CSV.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadAnalysisById = async (id: string) => {
    try {
      setIsAnalyzing(true);
      const res = await fetch(`/api/analysis/${id}`);
      if (res.ok) {
        const data: AnalysisReport = await res.json();
        setReport(data);
        setActiveSection('overview');
        return;
      }
      if (id.includes('tech') || id === '44a45f33') {
        setReport(getSampleReport('tech'));
      } else {
        setReport(getSampleReport('lifestyle'));
      }
      setActiveSection('overview');
    } catch (err) {
      if (id.includes('tech') || id === '44a45f33') {
        setReport(getSampleReport('tech'));
      } else {
        setReport(getSampleReport('lifestyle'));
      }
      setActiveSection('overview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'Executive Overview';
      case 'analyse':
        return 'Analyze Video Link';
      case 'vader':
        return 'VADER Sentiment Intelligence';
      case 'huggingface':
        return 'Hugging Face Transformer Analytics';
      case 'emoji':
        return 'Emoji & Emotion Intelligence';
      case 'insights':
        return 'AI Insights & Synthesis Report';
      case 'history':
        return 'Analysis History Archive';
      case 'settings':
        return 'Methodology & API Settings';
      default:
        return 'AuraLens';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] dark:bg-[#101D17] text-[#24382D] dark:text-[#EAF5EC] flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onRefresh={() => {
            if (report) {
              handleAnalyze(report.video_info.video_url, true, 'lifestyle');
            }
          }}
          isAnalyzing={isAnalyzing}
          activeSectionTitle={getSectionTitle()}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Video URL Analysis Bar (Always present on Overview & Analyse Video) */}
          {(activeSection === 'overview' || activeSection === 'analyse') && (
            <VideoInputBar
              onAnalyzeUrl={handleAnalyze}
              onOpenCsvModal={() => setIsCsvModalOpen(true)}
              isAnalyzing={isAnalyzing}
              progressStep={progressStep}
            />
          )}

          {/* Render Active View */}
          {report ? (
            <>
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Featured Video Information Card */}
                  <VideoInfoCard metadata={report.video_info} />

                  {/* 4 Summary Metric Cards */}
                  <MetricCards
                    summary={report.summary}
                    selectedEngine={selectedEngine}
                    setSelectedEngine={setSelectedEngine}
                  />

                  {/* Large Interactive Visuals: Donut, Timeline Line, Grouped Bar */}
                  <OverviewVisuals summary={report.summary} darkMode={darkMode} />

                  {/* Comment Explorer */}
                  <CommentExplorer comments={report.comments} reportId={report.id} />
                </div>
              )}

              {activeSection === 'analyse' && (
                <div className="space-y-6">
                  <VideoInfoCard metadata={report.video_info} />
                  <OverviewVisuals summary={report.summary} darkMode={darkMode} />
                </div>
              )}

              {activeSection === 'vader' && (
                <VaderSection
                  summary={report.summary}
                  comments={report.comments}
                  darkMode={darkMode}
                />
              )}

              {activeSection === 'huggingface' && (
                <HuggingFaceSection
                  summary={report.summary}
                  comments={report.comments}
                  darkMode={darkMode}
                />
              )}

              {activeSection === 'emoji' && (
                <EmojiIntelligenceSection
                  summary={report.summary}
                  darkMode={darkMode}
                />
              )}

              {activeSection === 'insights' && (
                <AIInsightsReport
                  summary={report.summary}
                  videoInfo={report.video_info}
                />
              )}

              {activeSection === 'history' && (
                <HistorySection
                  onLoadAnalysis={handleLoadAnalysisById}
                  activeId={report.id}
                />
              )}

              {activeSection === 'settings' && <SettingsSection />}
            </>
          ) : isAnalyzing ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#285943] dark:text-[#88C9A1]" />
              <p className="text-sm font-semibold text-[#718579] dark:text-[#A5C2AC]">
                Initializing AuraLens sentiment pipeline...
              </p>
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-[#1C3025] border border-[#E2ECE5] dark:border-[#243E2E] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#24382D] dark:text-[#EAF5EC]">
                Unable to complete analysis
              </h3>
              <p className="text-xs text-[#718579] dark:text-[#A5C2AC]">
                {error || 'The analysis pipeline encountered an issue. Select a sample dataset or retry below.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() =>
                    handleAnalyze(
                      'https://www.tiktok.com/@sarah.botanicals/video/739182390142981023',
                      true,
                      'lifestyle'
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#285943] hover:bg-[#1f4534] dark:bg-[#88C9A1] dark:hover:bg-[#72b78d] text-white dark:text-[#101D17] text-xs font-bold transition-all cursor-pointer"
                >
                  Load Skincare Sample (25 Comments)
                </button>
                <button
                  onClick={() =>
                    handleAnalyze(
                      'https://www.tiktok.com/@mkbhd_tech/video/748192019482103948',
                      true,
                      'tech'
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-xs font-bold text-[#285943] dark:text-[#88C9A1] hover:bg-[#E8F1EA] dark:hover:bg-[#263D30] transition-all cursor-pointer"
                >
                  Load Tech Sample (12 Comments)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onUploadSuccess={(newReport) => {
          setReport(newReport);
          setActiveSection('overview');
        }}
      />
    </div>
  );
}
