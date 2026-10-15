import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "analyses.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            video_id TEXT,
            caption TEXT,
            author_username TEXT,
            total_comments INTEGER,
            data_source TEXT,
            primary_sentiment TEXT,
            positive_pct REAL,
            analysed_at TEXT,
            report_json TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_analysis(report: Dict[str, Any]):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    rep_id = report.get("id")
    video_info = report.get("video_info", {})
    summary = report.get("summary", {})
    vader_dist = summary.get("vader_distribution", {})
    
    primary_sent = "positive" if vader_dist.get("positive_pct", 0) > 50 else (
        "negative" if vader_dist.get("negative_pct", 0) > 40 else "neutral"
    )
    
    cursor.execute("""
        INSERT OR REPLACE INTO analyses (
            id, video_id, caption, author_username, total_comments, data_source,
            primary_sentiment, positive_pct, analysed_at, report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rep_id,
        video_info.get("video_id", "unknown"),
        video_info.get("caption", "TikTok Video Analysis"),
        video_info.get("author_username", "creator"),
        summary.get("total_comments", 0),
        video_info.get("data_source", "demo"),
        primary_sent,
        vader_dist.get("positive_pct", 0.0),
        video_info.get("analysed_at", datetime.utcnow().isoformat()),
        json.dumps(report)
    ))
    conn.commit()
    conn.close()

def get_history() -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, video_id, caption, author_username, total_comments, data_source,
               primary_sentiment, positive_pct, analysed_at
        FROM analyses ORDER BY analysed_at DESC LIMIT 50
    """)
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        history.append({
            "id": r[0],
            "video_id": r[1],
            "caption": r[2],
            "author_username": r[3],
            "total_comments": r[4],
            "data_source": r[5],
            "primary_sentiment": r[6],
            "positive_pct": r[7],
            "analysed_at": r[8]
        })
    return history

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT report_json FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if row and row[0]:
        return json.loads(row[0])
    return None
