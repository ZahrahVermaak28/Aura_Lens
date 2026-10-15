import os
import re
import json
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

class TikTokService:
    def __init__(self):
        self.api_key = os.getenv("TIKTOK_API_KEY")
        self.has_credentials = bool(self.api_key)

    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Validates TikTok URL and extracts video ID.
        Supports:
        - https://www.tiktok.com/@user/video/7123456789012345678
        - https://m.tiktok.com/v/7123456789012345678.html
        - https://vm.tiktok.com/ZMF... / https://vt.tiktok.com/...
        """
        if not url:
            return None
        
        # Resolve redirect for short links if needed
        clean_url = url.strip()
        if "vm.tiktok.com" in clean_url or "vt.tiktok.com" in clean_url:
            try:
                req = urllib.request.Request(clean_url, headers={"User-Agent": USER_AGENT})
                opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
                with opener.open(req, timeout=5) as resp:
                    clean_url = resp.geturl()
            except Exception:
                pass

        # Match /video/(\d+)
        match = re.search(r'/video/(\d+)', clean_url)
        if match:
            return match.group(1)
        
        # Match /v/(\d+)
        match = re.search(r'/v/(\d+)', clean_url)
        if match:
            return match.group(1)
            
        # Match standalone trailing digits
        digits = re.findall(r'(\d{15,22})', clean_url)
        if digits:
            return digits[0]

        return None

    def fetch_oembed_metadata(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fetches free official video metadata from TikTok's public oEmbed API.
        No API keys or credentials required.
        """
        try:
            oembed_url = f"https://www.tiktok.com/oembed?url={urllib.parse.quote(url)}"
            req = urllib.request.Request(oembed_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data
        except Exception:
            pass
        return None

    def fetch_video_data(self, url: str) -> Tuple[Optional[Dict[str, Any]], Optional[List[Dict[str, Any]]], Optional[str]]:
        """
        Directly retrieves public comments and metadata for the provided TikTok URL
        using free official oEmbed metadata and public comment endpoint.
        Returns: (video_metadata, comments_list, error_or_notice_message)
        """
        video_id = self.extract_video_id(url)
        if not video_id:
            return None, None, "Invalid TikTok URL format. Please provide a link such as https://www.tiktok.com/@username/video/7123456789012345678"

        # 1. Fetch free official video metadata via oEmbed
        oembed = self.fetch_oembed_metadata(url)
        
        caption = "TikTok Video Analysis"
        author_username = "tiktok_creator"
        author_nickname = "Creator"
        thumbnail_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"

        if oembed:
            caption = oembed.get("title") or caption
            author_username = oembed.get("author_unique_id") or author_username
            author_nickname = oembed.get("author_name") or author_nickname
            thumbnail_url = oembed.get("thumbnail_url") or thumbnail_url

        # 2. Fetch real public comments from TikTok's public web feed
        comments: List[Dict[str, Any]] = []
        try:
            import http.client
            comment_api_url = f"https://www.tiktok.com/api/comment/list/?aid=1988&aweme_id={video_id}&count=30&cursor=0"
            req = urllib.request.Request(
                comment_api_url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Referer": "https://www.tiktok.com/",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept-Encoding": "identity",
                }
            )
            raw_bytes = None
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    raw_bytes = resp.read()
            except http.client.IncompleteRead as e:
                raw_bytes = e.partial

            if raw_bytes:
                body = json.loads(raw_bytes.decode("utf-8", errors="ignore"))
                raw_comments = body.get("comments") or []
                for c in raw_comments:
                    cid = str(c.get("cid") or len(comments) + 1)
                    user_info = c.get("user") or {}
                    username = user_info.get("unique_id") or user_info.get("nickname") or f"user_{cid[:4]}"
                    text = c.get("text") or ""
                    likes = c.get("digg_count") or 0
                    create_time = c.get("create_time")
                    ts_str = datetime.fromtimestamp(create_time).isoformat() if create_time else datetime.utcnow().isoformat()
                    
                    if text.strip():
                        comments.append({
                            "comment_id": cid,
                            "author": username,
                            "comment_text": text.strip(),
                            "likes": likes,
                            "timestamp": ts_str
                        })
        except Exception as e:
            # If rate-limited or blocked by anti-bot verification
            return None, None, f"Network request to TikTok public comment service failed: {str(e)}"

        if not comments:
            return None, None, (
                "No public comments could be retrieved for this video. "
                "Possible reasons: Comments are disabled by the creator, the video is private or region-restricted, "
                "or TikTok anti-bot verification blocked data-center requests. "
                "You can explore the verified Sample Datasets or upload an exported CSV."
            )

        metadata = {
            "video_id": video_id,
            "video_url": url,
            "caption": caption,
            "author_username": author_username,
            "author_nickname": author_nickname,
            "thumbnail_url": thumbnail_url,
            "likes_count": None,
            "shares_count": None,
            "total_comments_retrieved": len(comments),
            "published_at": datetime.utcnow().isoformat(),
            "analysed_at": datetime.utcnow().isoformat(),
            "data_source": "live_public",
            "notice": f"Live public comment extraction: retrieved {len(comments)} comments directly from TikTok."
        }

        return metadata, comments, None
