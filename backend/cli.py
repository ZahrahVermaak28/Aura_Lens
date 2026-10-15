import sys
import json
import os
import uuid
import csv
import warnings
import logging
from datetime import datetime

# Direct all logging strictly to stderr so stdout is 100% valid JSON
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

# Silence pydantic v2 migration warnings
warnings.filterwarnings("ignore")

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.vader_service import analyze_vader
from backend.services.huggingface_service import analyze_huggingface_batch
from backend.services.emoji_service import analyze_emotion, extract_emoji_intelligence
from backend.services.insights_service import generate_insights
from backend.utils.text_processing import clean_comment_text, extract_emojis
from backend.db import init_db, save_analysis, get_history, get_analysis_by_id

init_db()

def to_dict(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    return obj

def load_sample_csv(filename: str):
    path = os.path.join(os.path.dirname(__file__), "data", filename)
    comments = []
    if os.path.exists(path):
        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                comments.append(row)
    return comments

def process_pipeline(raw_comments, video_metadata):
    cleaned_comments = []
    texts_to_predict = []

    for idx, item in enumerate(raw_comments):
        raw_text = item.get("comment_text") or item.get("text", "")
        cleaned = clean_comment_text(raw_text)
        texts_to_predict.append(cleaned if cleaned else raw_text)

    hf_results = analyze_huggingface_batch(texts_to_predict)

    vader_pos = 0
    vader_neg = 0
    vader_neu = 0
    hf_pos = 0
    hf_neg = 0
    hf_neu = 0
    agreements = 0
    disagreements = 0
    timeline_buckets = {}

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

        if vader_res.sentiment == hf_res.label:
            agreements += 1
            has_disagreement = False
        else:
            disagreements += 1
            has_disagreement = True

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

        if timestamp:
            try:
                date_key = str(timestamp)[:10]
                if date_key not in timeline_buckets:
                    timeline_buckets[date_key] = {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
                timeline_buckets[date_key][vader_res.sentiment] += 1
                timeline_buckets[date_key]["total"] += 1
            except Exception:
                pass

        cleaned_comments.append({
            "id": c_id,
            "text": raw_text,
            "cleaned_text": cleaned,
            "author": author,
            "timestamp": timestamp,
            "likes": likes,
            "vader": to_dict(vader_res),
            "huggingface": to_dict(hf_res),
            "emotion": to_dict(emotion_res),
            "emojis": emojis,
            "emoji_count": len(emojis),
            "has_disagreement": has_disagreement
        })

    total = len(cleaned_comments)
    if total == 0:
        return {"error": "No comments found"}

    vader_dist = {
        "positive": vader_pos,
        "negative": vader_neg,
        "neutral": vader_neu,
        "positive_pct": round((vader_pos / total) * 100, 1),
        "negative_pct": round((vader_neg / total) * 100, 1),
        "neutral_pct": round((vader_neu / total) * 100, 1),
    }

    hf_dist = {
        "positive": hf_pos,
        "negative": hf_neg,
        "neutral": hf_neu,
        "positive_pct": round((hf_pos / total) * 100, 1),
        "negative_pct": round((hf_neg / total) * 100, 1),
        "neutral_pct": round((hf_neu / total) * 100, 1),
    }

    agreement_rate = round((agreements / total) * 100, 1)

    top_emojis, emotion_dist, emoji_comp = extract_emoji_intelligence(cleaned_comments)
    conf_avg = round(sum(c["huggingface"]["confidence"] for c in cleaned_comments) / total, 3)

    timeline = []
    for d in sorted(timeline_buckets.keys()):
        b = timeline_buckets[d]
        timeline.append({
            "date": d,
            "positive": b["positive"],
            "negative": b["negative"],
            "neutral": b["neutral"],
            "total": b["total"]
        })

    from backend.models.schemas import SentimentDistribution
    insights = generate_insights(
        total_comments=total,
        vader_dist=SentimentDistribution(**vader_dist),
        hf_dist=SentimentDistribution(**hf_dist),
        agreement_rate=agreement_rate,
        disagreement_count=disagreements,
        top_emojis=top_emojis,
        emotion_dist=emotion_dist,
        emoji_comp=emoji_comp,
        has_timestamps=len(timeline) > 0
    )

    summary = {
        "total_comments": total,
        "vader_distribution": vader_dist,
        "hf_distribution": hf_dist,
        "agreement_rate": agreement_rate,
        "disagreement_count": disagreements,
        "top_emojis": [to_dict(e) for e in top_emojis],
        "emotion_distribution": emotion_dist,
        "confidence_avg": conf_avg,
        "emoji_comparison": to_dict(emoji_comp),
        "timeline": timeline,
        "insights": to_dict(insights)
    }

    report_id = str(uuid.uuid4())[:8]
    metadata = {
        "video_id": str(video_metadata.get("video_id", "tiktok_video")),
        "video_url": str(video_metadata.get("video_url", "")),
        "caption": str(video_metadata.get("caption", "TikTok Video Analysis")),
        "author_username": str(video_metadata.get("author_username", "creator")),
        "author_nickname": video_metadata.get("author_nickname"),
        "thumbnail_url": video_metadata.get("thumbnail_url"),
        "likes_count": video_metadata.get("likes_count"),
        "shares_count": video_metadata.get("shares_count"),
        "total_comments_retrieved": total,
        "published_at": video_metadata.get("published_at"),
        "analysed_at": datetime.utcnow().isoformat(),
        "data_source": video_metadata.get("data_source", "demo"),
        "notice": video_metadata.get("notice")
    }

    report = {
        "id": report_id,
        "video_info": metadata,
        "summary": summary,
        "comments": cleaned_comments
    }

    save_analysis(report)
    return report

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        return

    action = sys.argv[1]

    if action == "health":
        print(json.dumps({"status": "healthy", "engine": "python-vader-roberta"}))
        return

    if action == "history":
        print(json.dumps(get_history()))
        return

    if action == "get_analysis":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "No analysis ID provided"}))
            return
        rep = get_analysis_by_id(sys.argv[2])
        print(json.dumps(rep or {"error": "Not found"}))
        return

    if action == "analyse_video":
        input_data = json.loads(sys.stdin.read())
        url = input_data.get("url", "").strip()
        dataset = input_data.get("sample_dataset", "lifestyle")
        demo_mode = input_data.get("demo_mode", False)
        
        from backend.services.tiktok_service import TikTokService
        ts = TikTokService()

        # Distinguish between sample datasets and real TikTok link requests
        is_sample = demo_mode or ("sarah.botanicals" in url) or ("mkbhd" in url) or not url

        if not is_sample:
            # LIVE TIKTOK RETRIEVAL REQUESTED - Do NOT substitute sample data
            metadata, live_comments, err_msg = ts.fetch_video_data(url)
            if err_msg or not live_comments:
                print(json.dumps({"error": err_msg or "Failed to retrieve public comments from TikTok."}))
                sys.exit(1)
            
            report = process_pipeline(live_comments, metadata)
            print(json.dumps(report))
            return

        # Explicit Sample Dataset Mode
        video_id = ts.extract_video_id(url) or "sample_video"
        csv_file = f"sample_tiktok_{dataset}.csv" if dataset in ["lifestyle", "tech"] else "sample_tiktok_lifestyle.csv"
        comments = load_sample_csv(csv_file)

        captions = {
            "lifestyle": "Botanical skincare morning routine & glow secrets 🌿✨",
            "tech": "Is the new M4 OLED MacBook worth upgrading? Honest 2-week review 💻"
        }

        metadata = {
            "video_id": video_id,
            "video_url": url,
            "caption": captions.get(dataset, "TikTok Viral Video Analysis"),
            "author_username": "sarah.botanicals" if dataset == "lifestyle" else "mkbhd_tech",
            "author_nickname": "Sarah M." if dataset == "lifestyle" else "Tech Reviews",
            "thumbnail_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80" if dataset == "lifestyle" else "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            "likes_count": 84200 if dataset == "lifestyle" else 142000,
            "shares_count": 12400 if dataset == "lifestyle" else 18500,
            "published_at": "2026-10-01T12:00:00Z",
            "data_source": "demo",
            "notice": f"Sample demonstration dataset ({len(comments)} comments) loaded for video {video_id}"
        }

        report = process_pipeline(comments, metadata)
        print(json.dumps(report))
        return

    if action == "analyse_csv":
        input_data = json.loads(sys.stdin.read())
        comments = input_data.get("comments_data", [])
        metadata = {
            "video_id": input_data.get("video_id", "uploaded_video"),
            "video_url": f"https://www.tiktok.com/@{input_data.get('author', 'creator')}/video/{input_data.get('video_id', 'custom')}",
            "caption": input_data.get("caption", "Uploaded TikTok Video Comments"),
            "author_username": input_data.get("author", "creator"),
            "likes_count": None,
            "shares_count": None,
            "data_source": "csv_upload",
            "notice": f"Parsed {len(comments)} comments directly from uploaded CSV export."
        }
        report = process_pipeline(comments, metadata)
        print(json.dumps(report))
        return

if __name__ == "__main__":
    main()
