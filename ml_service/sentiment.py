# sentiment.py

import os
import sys

try:
    from .news_scraper import get_stock_headlines
except ImportError:
    try:
        from news_scraper import get_stock_headlines
    except ImportError:
        def get_stock_headlines(symbol: str, limit: int = 5):
            return []

# -------------------------------------------------------------
# Financial Lexicon for High-Accuracy Financial Sentiment
# -------------------------------------------------------------
FINANCIAL_LEXICON = {
    # Bullish / Positive terms
    "beat": 2.2, "beats": 2.2, "beating": 2.0, "beaten": 1.5,
    "surge": 2.5, "surges": 2.5, "surged": 2.5, "surging": 2.5,
    "rally": 2.5, "rallies": 2.5, "rallied": 2.5, "rallying": 2.5,
    "soar": 2.5, "soars": 2.5, "soared": 2.5, "soaring": 2.5,
    "jump": 2.0, "jumps": 2.0, "jumped": 2.0, "jumping": 2.0,
    "gain": 1.8, "gains": 1.8, "gained": 1.8, "gaining": 1.8,
    "growth": 1.8, "growing": 1.8, "grew": 1.8,
    "profit": 2.0, "profits": 2.0, "profitable": 2.0, "profitability": 2.0,
    "bullish": 2.5, "bull": 1.8, "bulls": 1.8,
    "upgrade": 2.2, "upgrades": 2.2, "upgraded": 2.2, "upgrading": 2.2,
    "outperform": 2.2, "outperformed": 2.2, "outperforming": 2.2,
    "buy": 1.5, "strong-buy": 2.5, "overweight": 1.8,
    "record": 1.5, "high": 1.2, "highs": 1.2, "all-time high": 3.0,
    "dividend": 1.2, "dividends": 1.2, "revenue growth": 2.2,
    "breakthrough": 2.0, "partnership": 1.5, "acquisition": 1.2,
    "expansion": 1.5, "positive": 1.5, "optimistic": 1.8,

    # Bearish / Negative terms
    "plunge": -2.8, "plunges": -2.8, "plunged": -2.8, "plunging": -2.8,
    "slump": -2.5, "slumps": -2.5, "slumped": -2.5, "slumping": -2.5,
    "drop": -2.0, "drops": -2.0, "dropped": -2.0, "dropping": -2.0,
    "fall": -2.0, "falls": -2.0, "fell": -2.0, "falling": -2.0,
    "loss": -2.2, "losses": -2.2, "losing": -2.0, "lost": -1.8,
    "miss": -2.2, "misses": -2.2, "missed": -2.2, "missing": -2.0,
    "downgrade": -2.5, "downgrades": -2.5, "downgraded": -2.5, "downgrading": -2.5,
    "bearish": -2.5, "bear": -1.8, "bears": -1.8,
    "underperform": -2.2, "underperformed": -2.2, "underperforming": -2.2,
    "sell": -1.5, "strong-sell": -2.5, "underweight": -1.8,
    "crash": -3.2, "crashes": -3.2, "crashed": -3.2, "crashing": -3.2,
    "recession": -2.8, "inflation": -1.5, "lawsuit": -2.2, "fine": -1.8, "fined": -1.8,
    "bankrupt": -3.5, "bankruptcy": -3.5, "default": -3.0, "defaults": -3.0,
    "layoff": -2.0, "layoffs": -2.0, "cut": -1.5, "cuts": -1.5, "scandal": -2.8,
    "fraud": -3.5, "investigation": -2.0, "negative": -1.5, "pessimistic": -1.8,
}

_vader_analyzer = None

def _get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None:
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            _vader_analyzer = SentimentIntensityAnalyzer()
            _vader_analyzer.lexicon.update(FINANCIAL_LEXICON)
        except ImportError:
            _vader_analyzer = False
    return _vader_analyzer


# -------------------------------------------------------------
# Single Text Sentiment Analysis
# -------------------------------------------------------------
def analyze_sentiment(text: str):
    """
    Analyze sentiment of a single financial headline or text.
    Returns: {"sentiment": "positive"|"negative"|"neutral", "confidence": float}
    """
    if not text or not text.strip():
        return {"sentiment": "neutral", "confidence": 0.5}

    analyzer = _get_vader_analyzer()

    if analyzer:
        scores = analyzer.polarity_scores(text)
        compound = scores["compound"]
        pos = scores["pos"]
        neg = scores["neg"]
        neu = scores["neu"]

        if compound >= 0.15:
            sentiment = "positive"
            confidence = min(0.95, round(0.55 + abs(compound) * 0.4, 2))
        elif compound <= -0.15:
            sentiment = "negative"
            confidence = min(0.95, round(0.55 + abs(compound) * 0.4, 2))
        else:
            sentiment = "neutral"
            confidence = min(0.85, round(0.50 + neu * 0.3, 2))

        return {
            "sentiment": sentiment,
            "confidence": float(confidence)
        }

    # Lightweight rule-based fallback if vaderSentiment is unavailable
    text_lower = text.lower()
    pos_score = 0.0
    neg_score = 0.0

    for word, weight in FINANCIAL_LEXICON.items():
        if word in text_lower:
            if weight > 0:
                pos_score += weight
            else:
                neg_score += abs(weight)

    diff = pos_score - neg_score
    if diff > 1.0:
        sentiment = "positive"
        confidence = min(0.92, 0.60 + min(diff * 0.1, 0.32))
    elif diff < -1.0:
        sentiment = "negative"
        confidence = min(0.92, 0.60 + min(abs(diff) * 0.1, 0.32))
    else:
        sentiment = "neutral"
        confidence = 0.55

    return {
        "sentiment": sentiment,
        "confidence": float(round(confidence, 2))
    }


# -------------------------------------------------------------
# Stock-Level Sentiment Analysis (Aggregated Real News)
# -------------------------------------------------------------
def analyze_stock_sentiment(symbol: str):
    """
    Fetch real Yahoo Finance headlines,
    run sentiment analysis on each,
    compute weighted average sentiment.
    """
    headlines = get_stock_headlines(symbol)

    if not headlines:
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "headlines_used": 0
        }

    scores = []

    for headline in headlines:
        result = analyze_sentiment(headline)

        if result["sentiment"] == "positive":
            scores.append(result["confidence"])
        elif result["sentiment"] == "negative":
            scores.append(-result["confidence"])
        else:
            scores.append(0.0)

    avg_score = sum(scores) / len(scores) if scores else 0.0

    if avg_score > 0.15:
        final_sentiment = "positive"
    elif avg_score < -0.15:
        final_sentiment = "negative"
    else:
        final_sentiment = "neutral"

    return {
        "sentiment": final_sentiment,
        "confidence": float(round(abs(avg_score), 2)),
        "headlines_used": len(headlines)
    }
