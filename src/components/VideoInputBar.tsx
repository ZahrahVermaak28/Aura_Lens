
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (isAnalyzing) return;

  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return;
  }

  // Only use sample comments when demo mode is selected.
  if (demoMode) {
    onAnalyzeUrl(cleanUrl, true, dataset);
    return;
  }

  // Analyse the real TikTok video URL.
  const isTikTokUrl =
    /^https?:\/\/(www\.|m\.)?tiktok\.com\/.+/i.test(cleanUrl) ||
    /^https?:\/\/(vm|vt)\.tiktok\.com\/.+/i.test(cleanUrl);

  if (!isTikTokUrl) {
    alert("Please enter a valid TikTok video URL.");
    return;
  }

  onAnalyzeUrl(cleanUrl, false, "custom");
};

  const handleSelectSample = (sampleType: 'lifestyle' | 'tech') => {
    setDataset(sampleType);
    setDemoMode(true);
    const newUrl =
      sampleType === 'lifestyle'
        ? 'https://www.tiktok.com/@sarah.botanicals/video/739182390142981023'
        : 'https://www.tiktok.com/@mkbhd_tech/video/748192019482103948';
    setUrl(newUrl);
    onAnalyzeUrl(newUrl, true, sampleType);
  };

  return (
    <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] p-5 shadow-sm botanical-glow transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Main URL Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#718579] dark:text-[#A5C2AC]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
           onChange={(e) => {
  setUrl(e.target.value);
  setDemoMode(false);
}}
              placeholder="Paste a TikTok video link to discover what people are saying..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-xl text-sm font-medium text-[#24382D] dark:text-[#EAF5EC] placeholder-[#718579] dark:placeholder-[#A5C2AC]/60 focus:outline-none focus:ring-2 focus:ring-[#285943] dark:focus:ring-[#88C9A1] transition-all"
              disabled={isAnalyzing}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isAnalyzing || !url}
              className="px-6 py-3.5 bg-[#285943] hover:bg-[#1f4534] dark:bg-[#88C9A1] dark:hover:bg-[#72b78d] text-white dark:text-[#101D17] text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Processing...' : 'Analyse Video'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCsvModal}
              disabled={isAnalyzing}
              className="px-4 py-3.5 bg-[#E8F1EA] hover:bg-[#d5e4d8] dark:bg-[#263D30] dark:hover:bg-[#2f4b3b] text-[#285943] dark:text-[#88C9A1] text-sm font-semibold rounded-xl border border-[#A3BFA8]/40 dark:border-[#243E2E] transition-all flex items-center gap-2 cursor-pointer"
              title="Upload CSV of exported comments"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>
          </div>
        </div>

        {/* Mode & Demo Selector Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#718579] dark:text-[#A5C2AC]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#24382D] dark:text-[#EAF5EC]">Datasets:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-[#E8F1EA] dark:bg-[#263D30] text-[#285943] dark:text-[#88C9A1] border border-[#A3BFA8]/40 dark:border-[#243E2E]">
              Sample Data
            </span>
            <button
              type="button"
              onClick={() => handleSelectSample('lifestyle')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                dataset === 'lifestyle'
                  ? 'bg-[#285943] text-white border-[#285943] dark:bg-[#88C9A1] dark:text-[#101D17] dark:border-[#88C9A1] font-semibold'
                  : 'bg-[#F7FAF7] dark:bg-[#15271D] border-[#E2ECE5] dark:border-[#243E2E] hover:border-[#A3BFA8]'
              }`}
            >
              🌿 Skincare Lifestyle (25 Comments)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('tech')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                dataset === 'tech'
                  ? 'bg-[#285943] text-white border-[#285943] dark:bg-[#88C9A1] dark:text-[#101D17] dark:border-[#88C9A1] font-semibold'
                  : 'bg-[#F7FAF7] dark:bg-[#15271D] border-[#E2ECE5] dark:border-[#243E2E] hover:border-[#A3BFA8]'
              }`}
            >
              💻 Tech Hardware Review (12 Comments)
            </button>
          </div>
        </div>

        {/* Honest Progress Stepper (Only visible while analyzing) */}
        {isAnalyzing && (
          <div className="mt-4 p-4 rounded-xl bg-[#E8F1EA] dark:bg-[#15271D] border border-[#A3BFA8]/40 dark:border-[#243E2E] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#285943] dark:text-[#88C9A1]">
              <span>Stage {progressStep + 1} of 7: {PROGRESS_STEPS[progressStep]}</span>
              <span className="font-mono">{Math.round(((progressStep + 1) / 7) * 100)}%</span>
            </div>

            <div className="w-full bg-white dark:bg-[#263D30] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#285943] dark:bg-[#88C9A1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((progressStep + 1) / 7) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 pt-1 text-[10px]">
              {PROGRESS_STEPS.map((stepName, i) => (
                <div
                  key={stepName}
                  className={`flex items-center gap-1 ${
                    i <= progressStep
                      ? 'text-[#285943] dark:text-[#88C9A1] font-bold'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {i < progressStep ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : i === progressStep ? (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                  )}
                  <span className="truncate">{i + 1}. {stepName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
