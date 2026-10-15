import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseAndAnalyzeCsvClient } from '../utils/clientSentiment';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: any) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState('custom_upload_video');
  const [caption, setCaption] = useState('TikTok User Feedback Export');
  const [author, setAuthor] = useState('creator');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv file format.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('video_id', videoId);
    formData.append('caption', caption);
    formData.append('author', author);

    try {
      const res = await fetch('/api/analyse/csv', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const report = await res.json();
        onUploadSuccess(report);
        onClose();
        return;
      }

      // If backend endpoint is unavailable (e.g. published static environment)
      const text = await file.text();
      const clientReport = parseAndAnalyzeCsvClient(text, videoId, caption, author);
      onUploadSuccess(clientReport);
      onClose();
    } catch (err: any) {
      try {
        const text = await file.text();
        const clientReport = parseAndAnalyzeCsvClient(text, videoId, caption, author);
        onUploadSuccess(clientReport);
        onClose();
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || err.message || 'An error occurred during file upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'comment_id,author,comment_text,likes,timestamp\n' +
      '1,tiktok_fan,"Absolutely loved this tutorial! So helpful and well explained ✨",450,2026-10-01T12:00:00Z\n' +
      '2,tech_reviewer,"Honestly quite disappointed with the build quality, feel like a scam 💀",120,2026-10-01T13:30:00Z\n' +
      '3,curious_viewer,"What is the link to the product mentioned in the video?",80,2026-10-01T14:15:00Z\n' +
      '4,beauty_guru,"Slay queen! Your recommendations never miss 🔥❤️",980,2026-10-01T15:00:00Z\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'auralens_sample_tiktok_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="p-5 border-b border-[#E2ECE5] dark:border-[#243E2E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F1EA] dark:bg-[#263D30] text-[#285943] dark:text-[#88C9A1] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#24382D] dark:text-[#EAF5EC]">
                Upload Exported TikTok Comments CSV
              </h3>
              <p className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">
                Alternative method for videos where live API access is restricted
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#718579] hover:text-[#24382D] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#A3BFA8] dark:border-[#3D5A46] rounded-xl p-6 text-center cursor-pointer hover:bg-[#F7FAF7] dark:hover:bg-[#15271D] transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#E8F1EA] dark:bg-[#263D30] text-[#285943] dark:text-[#88C9A1] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            {file ? (
              <div className="space-y-1">
                <span className="font-bold text-[#285943] dark:text-[#88C9A1] block truncate">
                  {file.name}
                </span>
                <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">
                  {(file.size / 1024).toFixed(1)} KB · Click to replace
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-semibold text-[#24382D] dark:text-[#EAF5EC] block">
                  Click to browse or drop CSV file here
                </span>
                <span className="text-[11px] text-[#718579] dark:text-[#A5C2AC]">
                  Must include 'comment_text' or 'comment' column
                </span>
              </div>
            )}
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#718579] dark:text-[#A5C2AC] mb-1">
                Creator Username
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-lg text-[#24382D] dark:text-[#EAF5EC] focus:outline-none"
                placeholder="creator_handle"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#718579] dark:text-[#A5C2AC] mb-1">
                Video Identifier
              </label>
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-lg text-[#24382D] dark:text-[#EAF5EC] focus:outline-none"
                placeholder="video_12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#718579] dark:text-[#A5C2AC] mb-1">
              Video Description / Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E] rounded-lg text-[#24382D] dark:text-[#EAF5EC] focus:outline-none"
              placeholder="Morning Routine Skincare"
            />
          </div>

          {/* Helper Template Download */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E2ECE5] dark:border-[#243E2E]">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="text-[#285943] dark:text-[#88C9A1] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sample CSV template</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-[#718579] dark:text-[#A5C2AC] hover:bg-[#F7FAF7] dark:hover:bg-[#15271D] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-5 py-2 rounded-xl bg-[#285943] hover:bg-[#1f4534] dark:bg-[#88C9A1] dark:hover:bg-[#72b78d] text-white dark:text-[#101D17] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Analyzing CSV...' : 'Process & Analyze'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
