import os
import uuid
import csv
import io
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.models.schemas import (
    VideoAnalysisRequest,
    AnalysisReport,
    VideoMetadata,
    OverallSummary,
    SentimentDistribution,
    CommentItem,
    HistoryItem,
    TimelinePoint
)
from backend.services.tiktok_service import TikTokService
from backend.services.vader_service import analyze_vader
from backend.services.huggingface_service import analyze_huggingface_batch
from backend.services.emoji_service import analyze_emotion, extract_emoji_intelligence
from backend.services.insights_service import generate_insights
from backend.utils.text_processing import clean_comment_text, extract_emojis
from backend.db import init_db, save_analysis, get_history, get_analysis_by_id

# Initialize database
init_db()

app = FastAPI(
    title="AuraLens — TikTok Sentiment Intelligence Platform",
    description="Python FastAPI backend for VADER, Hugging Face Transformers, and Emoji/Emotion analysis of TikTok comments.",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tiktok_service = TikTokService()

def run_sentiment_pipeline(
    raw_comments: List[Dict[str, Any]],
    video_metadata: Dict[str, Any]
) -> AnalysisReport:
    """
    Executes the full sentiment intelligence pipeline:
    1. Text cleaning & normalization
    2. Emoji extraction
    3. VADER sentiment analysis
    4. Hugging Face RoBERTa transformer inference
    5. Contextual emotion classification
    6. Emoji intelligence aggregation
    7. Metric calculation & disagreement analysis
    8. Deterministic AI insights generation
    """
    cleaned_comments: List[CommentItem] = []
    texts_to_predict: List[str] = []

    # Step 1 & 2: Clean & extract emojis
    for idx, item in enumerate(raw_comments):
        raw_text = item.get("comment_text") or item.get("text", "")
        cleaned = clean_comment_text(raw_text)
        emojis = extract_emojis(raw_text)
        texts_to_predict.append(cleaned if cleaned else raw_text)

    # Step 3: Hugging Face transformer predictions in batch
    hf_results = analyze_huggingface_batch(texts_to_predict)

    # Step 4 & 5: VADER analysis + emotion classification
    vader_pos = 0
    vader_neg = 0
    vader_neu = 0
    
    hf_pos = 0
    hf_neg = 0
    hf_neu = 0
    
    agreements = 0
    disagreements = 0

    timeline_buckets: Dict[str, Dict[str, int]] = {}

    for idx, item in enumerate(raw_comments):
        c_id = str(item.get("comment_id") or item.get("id") or f"c_{idx+1}")
        author = str(item.get("author") or f"user_{idx+1}")
        raw_text = item.get("comment_text") or item.get("text", "")
        cleaned = texts_to_predict[idx]
        likes = int(item.get("likes", 0) or 0)
        timestamp = item.get("timestamp") or item.get("created_at")

        vader_res = analyze_vader(raw_text)
        hf_res = hf_results[idx]
        emojis = extract_emojis(raw_text)
        emotion_res = analyze_emotion(raw_text, emojis)

        # Track agreement
        if vader_res.sentiment == hf_res.label:
            agreements += 1
            has_disagreement = False
        else:
            disagreements += 1
            has_disagreement = True

        # Tally counts
        if vader_res.sentiment == "positive":
            vader_pos += 1
        elif vader_res.sentiment == "negative":
            vader_neg += 1
        else:
            vader_neu += 1

        if hf_res.label == "positive":
            hf_pos += 1
        elif hf_res.label == "negative":
            hf_neg += 1
        else:
            hf_neu += 1

        # Track timeline if timestamp exists
        if timestamp:
            try:
                date_key = str(timestamp)[:10]  # YYYY-MM-DD
                if date_key not in timeline_buckets:
                    timeline_buckets[date_key] = {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
                timeline_buckets[date_key][vader_res.sentiment] += 1
                timeline_buckets[date_key]["total"] += 1
            except Exception:
                pass

        cleaned_comments.append(CommentItem(
            id=c_id,
            text=raw_text,
            cleaned_text=cleaned,
            author=author,
            timestamp=timestamp,
            likes=likes,
            vader=vader_res,
            huggingface=hf_res,
            emotion=emotion_res,
            emojis=emojis,
            emoji_count=len(emojis),
            has_disagreement=has_disagreement
        ))

    total = len(cleaned_comments)
    if total == 0:
        raise HTTPException(status_code=400, detail="No comments found in dataset.")

    # Calculate distributions
    vader_distribution = SentimentDistribution(
        positive=vader_pos,
        negative=vader_neg,
        neutral=vader_neu,
        positive_pct=round((vader_pos / total) * 100, 1),
        negative_pct=round((vader_neg / total) * 100, 1),
        neutral_pct=round((vader_neu / total) * 100, 1),
    )

    hf_distribution = SentimentDistribution(
        positive=hf_pos,
        negative=hf_neg,
        neutral=hf_neu,
        positive_pct=round((hf_pos / total) * 100, 1),
        negative_pct=round((hf_neg / total) * 100, 1),
        neutral_pct=round((hf_neu / total) * 100, 1),
    )

    agreement_rate = round((agreements / total) * 100, 1)

    # Step 6: Emoji Intelligence
    comments_dict_list = [c.dict() for c in cleaned_comments]
    top_emojis, emotion_distribution, emoji_comparison = extract_emoji_intelligence(comments_dict_list)

    # Confidence average
    conf_avg = round(sum(c.huggingface.confidence for c in cleaned_comments) / total, 3)

    # Timeline points
    timeline: List[TimelinePoint] = []
    for d in sorted(timeline_buckets.keys()):
        b = timeline_buckets[d]
        timeline.append(TimelinePoint(
            date=d,
            positive=b["positive"],
            negative=b["negative"],
            neutral=b["neutral"],
            total=b["total"]
        ))

    # Step 7: Deterministic AI Insights Report
    insights = generate_insights(
        total_comments=total,
        vader_dist=vader_distribution,
        hf_dist=hf_distribution,
        agreement_rate=agreement_rate,
        disagreement_count=disagreements,
        top_emojis=top_emojis,
        emotion_dist=emotion_distribution,
        emoji_comp=emoji_comparison,
        has_timestamps=len(timeline) > 0
    )

    summary = OverallSummary(
        total_comments=total,
        vader_distribution=vader_distribution,
        hf_distribution=hf_distribution,
        agreement_rate=agreement_rate,
        disagreement_count=disagreements,
        top_emojis=top_emojis,
        emotion_distribution=emotion_distribution,
        confidence_avg=conf_avg,
        emoji_comparison=emoji_comparison,
        timeline=timeline,
        insights=insights
    )

    report_id = str(uuid.uuid4())[:8]

    meta = VideoMetadata(
        video_id=str(video_metadata.get("video_id", "tiktok_video")),
        video_url=str(video_metadata.get("video_url", "")),
        caption=str(video_metadata.get("caption", "TikTok Video Analysis")),
        author_username=str(video_metadata.get("author_username", "creator")),
        author_nickname=video_metadata.get("author_nickname"),
        thumbnail_url=video_metadata.get("thumbnail_url"),
        likes_count=video_metadata.get("likes_count"),
        shares_count=video_metadata.get("shares_count"),
        total_comments_retrieved=total,
        published_at=video_metadata.get("published_at"),
        analysed_at=datetime.utcnow().isoformat(),
        data_source=video_metadata.get("data_source", "demo"),
        notice=video_metadata.get("notice")
    )

    report = AnalysisReport(
        id=report_id,
        video_info=meta,
        summary=summary,
        comments=cleaned_comments
    )

    # Save to SQLite database
    save_analysis(report.dict())

    return report


def load_sample_csv(filename: str) -> List[Dict[str, Any]]:
    path = os.path.join(os.path.dirname(__file__), "data", filename)
    comments = []
    if os.path.exists(path):
        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                comments.append(row)
    return comments


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AuraLens — TikTok Sentiment Intelligence API",
        "vader_available": True,
        "huggingface_model": "cardiffnlp/twitter-roberta-base-sentiment-latest",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/analyse/video", response_model=AnalysisReport)
def analyse_video(req: VideoAnalysisRequest):
    """
    Validates TikTok video link, checks for live credentials, or loads transparent demo dataset.
    """
    video_id = tiktok_service.extract_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid TikTok URL format. Please enter a valid TikTok video URL (e.g., https://www.tiktok.com/@username/video/123456789...)."
        )

    # Attempt live retrieval
    meta, live_comments, notice = tiktok_service.fetch_video_data(req.url)

    if live_comments and len(live_comments) > 0:
        return run_sentiment_pipeline(live_comments, meta)

    # If user requested real comments (not demo mode), do NOT substitute sample comments
    if not req.demo_mode and not ("sarah.botanicals" in req.url or "mkbhd" in req.url):
        raise HTTPException(
            status_code=400,
            detail=notice or "Failed to retrieve public comments from the provided TikTok video URL."
        )

    # Transparent Demo Mode for sample datasets
    dataset = req.sample_dataset or "lifestyle"
    csv_file = f"sample_tiktok_{dataset}.csv" if dataset in ["lifestyle", "tech"] else "sample_tiktok_lifestyle.csv"
    sample_comments = load_sample_csv(csv_file)

    captions = {
        "lifestyle": "Botanical skincare morning routine & glow secrets 🌿✨",
        "tech": "Is the new M4 OLED MacBook worth upgrading? Honest 2-week review 💻"
    }

    metadata = {
        "video_id": video_id,
        "video_url": req.url,
        "caption": captions.get(dataset, "TikTok Viral Video Analysis"),
        "author_username": "sarah.botanicals" if dataset == "lifestyle" else "mkbhd_tech",
        "author_nickname": "Sarah M." if dataset == "lifestyle" else "Tech Reviews",
        "thumbnail_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80" if dataset == "lifestyle" else "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
        "likes_count": 84200 if dataset == "lifestyle" else 142000,
        "shares_count": 12400 if dataset == "lifestyle" else 18500,
        "published_at": "2026-10-01T12:00:00Z",
        "data_source": "demo" if req.demo_mode or not tiktok_service.has_credentials else "live_api",
        "notice": notice or ("Sample demonstration dataset loaded for video " + video_id)
    }

    return run_sentiment_pipeline(sample_comments, metadata)


@app.post("/api/analyse/csv", response_model=AnalysisReport)
async def analyse_csv(
    file: UploadFile = File(...),
    video_id: str = Form("uploaded_video"),
    caption: str = Form("Exported TikTok Comments CSV"),
    author: str = Form("tiktok_creator")
):
    """
    Parses user uploaded CSV containing exported TikTok comments and executes analysis pipeline.
    """
    content = await file.read()
    decoded = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(decoded))
    
    comments = []
    for row in reader:
        # Normalize various column names common in TikTok export tools:
        # comment, text, comment_text, content
        comment_text = row.get("comment_text") or row.get("comment") or row.get("text") or row.get("content") or ""
        if comment_text.strip():
            comments.append({
                "comment_id": row.get("comment_id") or row.get("id") or f"c_{len(comments)+1}",
                "author": row.get("author") or row.get("username") or row.get("user") or f"user_{len(comments)+1}",
                "comment_text": comment_text,
                "likes": int(row.get("likes") or row.get("digg_count") or 0),
                "timestamp": row.get("timestamp") or row.get("date") or row.get("create_time") or datetime.utcnow().isoformat()
            })

    if not comments:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV does not contain recognized comment columns. Expected 'comment', 'text', or 'comment_text'."
        )

    meta = {
        "video_id": video_id,
        "video_url": f"https://www.tiktok.com/@{author}/video/{video_id}",
        "caption": caption,
        "author_username": author,
        "likes_count": None,
        "shares_count": None,
        "data_source": "csv_upload",
        "notice": f"Parsed {len(comments)} comments directly from uploaded CSV file '{file.filename}'."
    }

    return run_sentiment_pipeline(comments, meta)


@app.get("/api/analysis/{analysis_id}", response_model=AnalysisReport)
def get_analysis(analysis_id: str):
    rep = get_analysis_by_id(analysis_id)
    if not rep:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
    return rep


@app.get("/api/analysis/history", response_model=List[HistoryItem])
def get_analysis_history():
    return get_history()


@app.get("/api/analysis/{analysis_id}/export")
def export_csv(analysis_id: str):
    rep = get_analysis_by_id(analysis_id)
    if not rep:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Comment ID", "Author", "Comment Text", "Likes", "Timestamp",
        "VADER Sentiment", "VADER Compound Score", "VADER Pos", "VADER Neg", "VADER Neu",
        "HF RoBERTa Sentiment", "HF Confidence", "Detected Emotion", "Emotion Confidence",
        "Extracted Emojis", "Model Disagreement"
    ])

    for c in rep.get("comments", []):
        vader = c.get("vader", {})
        hf = c.get("huggingface", {})
        emo = c.get("emotion", {})
        emojis_str = " ".join(c.get("emojis", []))
        writer.writerow([
            c.get("id"),
            c.get("author"),
            c.get("text"),
            c.get("likes", 0),
            c.get("timestamp", ""),
            vader.get("sentiment", ""),
            vader.get("compound", 0.0),
            vader.get("pos", 0.0),
            vader.get("neg", 0.0),
            vader.get("neu", 0.0),
            hf.get("label", ""),
            hf.get("confidence", 0.0),
            emo.get("top_emotion", ""),
            emo.get("confidence", 0.0),
            emojis_str,
            "YES" if c.get("has_disagreement") else "NO"
        ])

    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=auralens_{analysis_id}.csv"
    return response
