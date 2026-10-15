export interface VaderResult {
  pos: number;
  neg: number;
  neu: number;
  compound: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface HuggingFaceResult {
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  model_name: string;
}

export interface EmotionResult {
  top_emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  confidence: number;
  breakdown: Record<string, number>;
}

export interface CommentItem {
  id: string;
  text: string;
  cleaned_text: string;
  author: string;
  timestamp?: string;
  likes: number;
  vader: VaderResult;
  huggingface: HuggingFaceResult;
  emotion: EmotionResult;
  emojis: string[];
  emoji_count: number;
  has_disagreement: boolean;
}

export interface VideoMetadata {
  video_id: string;
  video_url: string;
  caption: string;
  author_username: string;
  author_nickname?: string;
  thumbnail_url?: string;
  likes_count?: number;
  shares_count?: number;
  total_comments_retrieved: number;
  published_at?: string;
  analysed_at: string;
  data_source: 'live_api' | 'csv_upload' | 'demo';
  notice?: string;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

export interface EmojiStat {
  emoji: string;
  count: number;
  sentiment: string;
  associated_emotion: string;
}

export interface EmojiComparison {
  with_emoji_count: number;
  with_emoji_pos_pct: number;
  without_emoji_count: number;
  without_emoji_pos_pct: number;
}

export interface TimelinePoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface AIInsights {
  overall_reaction: string;
  emotional_reactions: string;
  emoji_behavior: string;
  model_comparison: string;
  notable_findings: string;
  limitations: string;
}

export interface OverallSummary {
  total_comments: number;
  vader_distribution: SentimentDistribution;
  hf_distribution: SentimentDistribution;
  agreement_rate: number;
  disagreement_count: number;
  top_emojis: EmojiStat[];
  emotion_distribution: Record<string, number>;
  confidence_avg: number;
  emoji_comparison: EmojiComparison;
  timeline: TimelinePoint[];
  insights: AIInsights;
}

export interface AnalysisReport {
  id: string;
  video_info: VideoMetadata;
  summary: OverallSummary;
  comments: CommentItem[];
}

export interface HistoryItem {
  id: string;
  video_id: string;
  caption: string;
  author_username: string;
  analysed_at: string;
  total_comments: number;
  data_source: string;
  primary_sentiment: string;
  positive_pct: number;
}
