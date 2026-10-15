import re
from typing import List, Dict, Any, Tuple
from collections import Counter
from backend.models.schemas import EmotionResult, EmojiStat, EmojiComparison
from backend.utils.text_processing import extract_emojis, convert_emojis_to_text

# Emotion classes supported by fine-tuned DistilRoBERTa emotion models:
# j-hartmann/emotion-english-distilroberta-base: joy, sadness, anger, fear, surprise, disgust, neutral
EMOTIONS = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]

# Lexical emotion markers & contextual triggers
EMOTION_KEYWORDS = {
    "joy": ["love", "obsessed", "slay", "best", "fire", "happy", "great", "smile", "queen", "king", "goat", "blessed", "beautiful", "stunning", "cute", "laugh", "lol", "lmao", "vibes"],
    "sadness": ["cry", "crying", "sad", "miss", "heartbroken", "tears", "depressed", "hurts", "pain", "sorry", "unfortunate", "bad"],
    "anger": ["hate", "mad", "annoying", "furious", "stop", "scam", "trash", "cringe", "liar", "fraud", "ruined", "waste", "disgusting", "worst"],
    "fear": ["scared", "fear", "terrified", "panic", "creepy", "worried", "nervous", "anxious", "danger", "warning", "caution"],
    "surprise": ["wait", "what", "no way", "omg", "shocked", "woah", "wow", "unbelievable", "really", "actually", "how", "insane"],
    "disgust": ["gross", "disgusting", "eww", "nasty", "puke", "sick", "yuck", "vile", "cringe"],
    "neutral": ["where", "price", "link", "recipe", "song", "who", "when", "tutorial", "brand", "location", "what is this", "info"]
}

# Dynamic contextual mapping for common emojis
EMOJI_BASE_MAP = {
    "😂": ("joy", "positive"),
    "😭": ("sadness", "negative"),  # Can shift to joy if combined with positive slang
    "❤️": ("joy", "positive"),
    "🔥": ("joy", "positive"),
    "💀": ("joy", "positive"),      # Gen Z 'dead with laughter'
    "✨": ("joy", "positive"),
    "😍": ("joy", "positive"),
    "🥺": ("sadness", "positive"),  # wholesome / cute
    "👏": ("joy", "positive"),
    "🙌": ("joy", "positive"),
    "💯": ("joy", "positive"),
    "👀": ("surprise", "neutral"),
    "😳": ("surprise", "neutral"),
    "😱": ("fear", "negative"),
    "🤡": ("disgust", "negative"),
    "🤮": ("disgust", "negative"),
    "😡": ("anger", "negative"),
    "🤬": ("anger", "negative"),
    "🤔": ("neutral", "neutral"),
    "🥰": ("joy", "positive"),
    "💅": ("joy", "positive"),
    "🎉": ("joy", "positive"),
    "💔": ("sadness", "negative"),
}

def analyze_emotion(text: str, emojis: List[str]) -> EmotionResult:
    """
    Classifies the dominant emotion and calculates distribution breakdown across
    joy, sadness, anger, fear, surprise, disgust, neutral.
    Uses converted emoji text context to catch sarcasm or shifts.
    """
    text_demojized = convert_emojis_to_text(text).lower()
    words = [w.strip(".,!?\"'()[]") for w in text_demojized.split()]
    
    # Emotion scores tally
    scores: Dict[str, float] = {e: 0.05 for e in EMOTIONS}
    
    # Scan keywords
    for emotion, kws in EMOTION_KEYWORDS.items():
        for kw in kws:
            if kw in words or (kw in text_demojized and len(kw) > 3):
                scores[emotion] += 0.35

    # Check contextual emoji indicators
    for emo in emojis:
        if emo in EMOJI_BASE_MAP:
            base_emo, _ = EMOJI_BASE_MAP[emo]
            
            # Sarcasm check: 😂 or 💀 mixed with negative words
            has_neg_word = any(nw in words for nw in ["cringe", "embarrassing", "scam", "flop", "hate", "clown", "fake", "bad"])
            if emo in ["😂", "💀"] and has_neg_word:
                scores["disgust"] += 0.4
                scores["anger"] += 0.2
                scores["joy"] += 0.1
            # "😭" mixed with "love", "slay", "obsessed", "beautiful" indicates wholesome tears
            elif emo == "😭" and any(pw in words for pw in ["love", "obsessed", "slay", "queen", "cute", "wholesome", "best"]):
                scores["joy"] += 0.5
                scores["sadness"] += 0.1
            else:
                scores[base_emo] += 0.4

    # Normalize breakdown into probabilities summing to 1.0
    total = sum(scores.values())
    breakdown = {e: round(scores[e] / total, 4) for e in EMOTIONS}
    
    # Identify top emotion
    top_emotion = max(breakdown.items(), key=lambda x: x[1])
    
    # Fallback to neutral if no distinct emotional trigger found
    if top_emotion[1] < 0.20 and not emojis:
        top_emotion = ("neutral", breakdown.get("neutral", 0.30))

    return EmotionResult(
        top_emotion=top_emotion[0],
        confidence=round(top_emotion[1], 4),
        breakdown=breakdown
    )

def extract_emoji_intelligence(comments_list: List[Dict[str, Any]]) -> Tuple[List[EmojiStat], Dict[str, int], EmojiComparison]:
    """
    Computes top emojis, sentiments associated with each emoji, emotion breakdown,
    and comparison between emoji-containing comments vs non-emoji comments.
    """
    emoji_counts = Counter()
    emoji_sentiments: Dict[str, List[str]] = {}
    emoji_emotions: Dict[str, List[str]] = {}
    
    with_emoji_comments = []
    without_emoji_comments = []
    
    emotion_overall_distribution = {e: 0 for e in EMOTIONS}

    for c in comments_list:
        emojis = c.get("emojis", [])
        vader_sent = c.get("vader", {}).get("sentiment", "neutral")
        top_emo = c.get("emotion", {}).get("top_emotion", "neutral")
        
        emotion_overall_distribution[top_emo] = emotion_overall_distribution.get(top_emo, 0) + 1
        
        if emojis:
            with_emoji_comments.append(c)
            for em in emojis:
                emoji_counts[em] += 1
                if em not in emoji_sentiments:
                    emoji_sentiments[em] = []
                    emoji_emotions[em] = []
                emoji_sentiments[em].append(vader_sent)
                emoji_emotions[em].append(top_emo)
        else:
            without_emoji_comments.append(c)

    # Top 10 emojis
    top_emojis: List[EmojiStat] = []
    for em, count in emoji_counts.most_common(12):
        sents = emoji_sentiments[em]
        emos = emoji_emotions[em]
        dominant_sent = Counter(sents).most_common(1)[0][0] if sents else "neutral"
        dominant_emo = Counter(emos).most_common(1)[0][0] if emos else "joy"
        top_emojis.append(EmojiStat(
            emoji=em,
            count=count,
            sentiment=dominant_sent,
            associated_emotion=dominant_emo
        ))

    # Compare emoji vs without emoji
    total_with = len(with_emoji_comments)
    total_without = len(without_emoji_comments)
    
    with_pos = len([c for c in with_emoji_comments if c.get("vader", {}).get("sentiment") == "positive"])
    without_pos = len([c for c in without_emoji_comments if c.get("vader", {}).get("sentiment") == "positive"])
    
    emoji_comparison = EmojiComparison(
        with_emoji_count=total_with,
        with_emoji_pos_pct=round((with_pos / total_with * 100), 1) if total_with > 0 else 0.0,
        without_emoji_count=total_without,
        without_emoji_pos_pct=round((without_pos / total_without * 100), 1) if total_without > 0 else 0.0
    )

    return top_emojis, emotion_overall_distribution, emoji_comparison
