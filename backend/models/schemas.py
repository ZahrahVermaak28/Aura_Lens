from typing import List, Dict, Optional, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self):
            return self._to_dict(self)

        def model_dump(self):
            return self.dict()

        @classmethod
        def _to_dict(cls, obj):
            if hasattr(obj, '__dict__'):
                return {k: cls._to_dict(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
            elif isinstance(obj, list):
                return [cls._to_dict(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: cls._to_dict(v) for k, v in obj.items()}
            return obj

    def Field(default=None, **kwargs):
        return default

class VideoAnalysisRequest(BaseModel):
    url: str
    demo_mode: bool = False
    sample_dataset: Optional[str] = "lifestyle"  # lifestyle, tech, travel

class CSVUploadRequest(BaseModel):
    video_id: Optional[str] = "custom_upload"
    video_caption: Optional[str] = "Uploaded TikTok Video Comments"
    author_username: Optional[str] = "community_upload"
    comments_data: List[Dict[str, Any]]

class VaderResult(BaseModel):
    pos: float
    neg: float
    neu: float
    compound: float
    sentiment: str  # positive, negative, neutral

class HuggingFaceResult(BaseModel):
    label: str  # positive, negative, neutral
    confidence: float
    model_name: str

class EmotionResult(BaseModel):
    top_emotion: str  # joy, sadness, anger, fear, surprise, disgust, neutral
    confidence: float
    breakdown: Dict[str, float]

class CommentItem(BaseModel):
    id: str
    text: str
    cleaned_text: str
    author: str
    timestamp: Optional[str] = None
    likes: int = 0
    vader: VaderResult
    huggingface: HuggingFaceResult
    emotion: EmotionResult
    emojis: List[str]
    emoji_count: int
    has_disagreement: bool

class VideoMetadata(BaseModel):
    video_id: str
    video_url: str
    caption: str
    author_username: str
    author_nickname: Optional[str] = None
    thumbnail_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    total_comments_retrieved: int
    published_at: Optional[str] = None
    analysed_at: str
    data_source: str  # 'live_api', 'csv_upload', 'demo'
    notice: Optional[str] = None

class SentimentDistribution(BaseModel):
    positive: int
    negative: int
    neutral: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float

class EmojiStat(BaseModel):
    emoji: str
    count: int
    sentiment: str
    associated_emotion: str

class EmojiComparison(BaseModel):
    with_emoji_count: int
    with_emoji_pos_pct: float
    without_emoji_count: int
    without_emoji_pos_pct: float

class TimelinePoint(BaseModel):
    date: str
    positive: int
    negative: int
    neutral: int
    total: int

class AIInsights(BaseModel):
    overall_reaction: str
    emotional_reactions: str
    emoji_behavior: str
    model_comparison: str
    notable_findings: str
    limitations: str

class OverallSummary(BaseModel):
    total_comments: int
    vader_distribution: SentimentDistribution
    hf_distribution: SentimentDistribution
    agreement_rate: float
    disagreement_count: int
    top_emojis: List[EmojiStat]
    emotion_distribution: Dict[str, int]
    confidence_avg: float
    emoji_comparison: EmojiComparison
    timeline: List[TimelinePoint]
    insights: AIInsights

class AnalysisReport(BaseModel):
    id: str
    video_info: VideoMetadata
    summary: OverallSummary
    comments: List[CommentItem]

class HistoryItem(BaseModel):
    id: str
    video_id: str
    caption: str
    author_username: str
    analysed_at: str
    total_comments: int
    data_source: str
    primary_sentiment: str
    positive_pct: float
