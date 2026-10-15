import re
from typing import List, Tuple

# Try importing emoji, provide robust regex fallback if not yet installed
try:
    import emoji
    HAS_EMOJI_PKG = True
except ImportError:
    HAS_EMOJI_PKG = False

# Common emoji regex fallback
EMOJI_REGEX = re.compile(
    r"[\U00010000-\U0010ffff]|"
    r"[\u200d\u200c\u2600-\u27bf\u2300-\u23ff\u2b50\u2b55\u3030\u303d\u3297\u3299]|"
    r"[\ud83c-\ud83e][\ud000-\udfff]"
)

def extract_emojis(text: str) -> List[str]:
    """
    Extracts all emoji characters from the comment text.
    Uses the Python emoji package if available, or regex pattern.
    """
    if not text:
        return []
    if HAS_EMOJI_PKG:
        return [c for c in text if emoji.is_emoji(c)]
    else:
        return EMOJI_REGEX.findall(text)

def clean_comment_text(text: str) -> str:
    """
    Cleans comment for NLP analysis:
    - Removes hyperlinked URLs
    - Normalizes multiple spaces
    - Preserves sentence capitalization and punctuation (!, ?, etc.) for VADER sentiment intensity
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Remove URL links
    cleaned = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Normalize multiple whitespace but preserve casing and punctuation
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def convert_emojis_to_text(text: str) -> str:
    """
    Converts emojis into readable English descriptions:
    e.g. 'Love this! ❤️' -> 'Love this! red heart'
    This assists Hugging Face models that haven't been tuned on emoji token embeddings.
    """
    if not text:
        return ""
    if HAS_EMOJI_PKG:
        return emoji.demojize(text, delimiters=(" ", " ")).replace("_", " ")
    return text
