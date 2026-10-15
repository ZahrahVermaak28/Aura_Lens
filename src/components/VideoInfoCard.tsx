import React from 'react';
import { ExternalLink, Heart, Share2, MessageSquare, Calendar, Clock, AlertCircle } from 'lucide-react';
import { VideoMetadata } from '../types';

interface VideoInfoCardProps {
  metadata: VideoMetadata;
}

export const VideoInfoCard: React.FC<VideoInfoCardProps> = ({ metadata }) => {
  const formattedDate = metadata.published_at
    ? new Date(metadata.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not provided';

  const analysisTime = new Date(metadata.analysed_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-[#1C3025] rounded-2xl border border-[#E2ECE5] dark:border-[#243E2E] p-6 shadow-sm space-y-6">
      {/* 1. Large Horizontal Video Image */}
      <div className="relative w-full h-64 sm:h-72 lg:h-80 rounded-xl overflow-hidden bg-[#E8F1EA] dark:bg-[#263D30] border border-[#A3BFA8]/30">
        {metadata.thumbnail_url ? (
          <img
            src={metadata.thumbnail_url}
            alt={metadata.caption}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#718579] dark:text-[#A5C2AC] p-6 text-center">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">No media preview available</span>
          </div>
        )}
      </div>

      {/* 2. Video Details Underneath Image */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-extrabold text-[#285943] dark:text-[#88C9A1]">
                @{metadata.author_username}
              </span>
              {metadata.author_nickname && (
                <span className="text-xs text-[#718579] dark:text-[#A5C2AC]">
                  ({metadata.author_nickname})
                </span>
              )}
              {metadata.data_source === 'demo' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-[#E8F1EA] dark:bg-[#263D30] text-[#285943] dark:text-[#88C9A1] border border-[#A3BFA8]/40 dark:border-[#243E2E]">
                  Sample Data
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#24382D] dark:text-[#EAF5EC] leading-snug">
              {metadata.caption}
            </h2>
          </div>

          {metadata.video_url && (
            <a
              href={metadata.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2ECE5] dark:border-[#243E2E] text-xs font-semibold text-[#285943] dark:text-[#88C9A1] hover:bg-[#E8F1EA] dark:hover:bg-[#263D30] transition-colors shrink-0 self-start"
            >
              <span>View on TikTok</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* 4-Column Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E]">
            <div className="flex items-center gap-1.5 text-xs text-[#718579] dark:text-[#A5C2AC] mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#285943] dark:text-[#88C9A1]" />
              <span>Comments</span>
            </div>
            <span className="text-lg font-black text-[#24382D] dark:text-[#EAF5EC]">
              {metadata.total_comments_retrieved.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E]">
            <div className="flex items-center gap-1.5 text-xs text-[#718579] dark:text-[#A5C2AC] mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Video Likes</span>
            </div>
            <span className="text-lg font-black text-[#24382D] dark:text-[#EAF5EC]">
              {metadata.likes_count != null ? metadata.likes_count.toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E]">
            <div className="flex items-center gap-1.5 text-xs text-[#718579] dark:text-[#A5C2AC] mb-1">
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Shares</span>
            </div>
            <span className="text-lg font-black text-[#24382D] dark:text-[#EAF5EC]">
              {metadata.shares_count != null ? metadata.shares_count.toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7FAF7] dark:bg-[#15271D] border border-[#E2ECE5] dark:border-[#243E2E]">
            <div className="flex items-center gap-1.5 text-xs text-[#718579] dark:text-[#A5C2AC] mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#285943] dark:text-[#88C9A1]" />
              <span>Published</span>
            </div>
            <span className="text-xs font-bold text-[#24382D] dark:text-[#EAF5EC] block truncate">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Audit & Notice Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-3 border-t border-[#E2ECE5] dark:border-[#243E2E]">
          <div className="flex items-center gap-2 text-[#718579] dark:text-[#A5C2AC]">
            <Clock className="w-3.5 h-3.5 text-[#A3BFA8]" />
            <span>Analysed today at {analysisTime} UTC</span>
            <span>·</span>
            <span className="font-mono text-[11px]">ID: {metadata.video_id}</span>
          </div>

          {metadata.notice && (
            <div className="text-[11px] text-[#718579] dark:text-[#A5C2AC] flex items-center gap-1 font-medium bg-[#F7FAF7] dark:bg-[#15271D] px-2.5 py-1 rounded-lg border border-[#E2ECE5] dark:border-[#243E2E]">
              <AlertCircle className="w-3 h-3 shrink-0 text-[#285943] dark:text-[#88C9A1]" />
              <span className="truncate max-w-xs">{metadata.notice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
