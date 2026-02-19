from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

from news_scraper import get_stock_headlines


# ----------------------------------
# Load FinBERT once (global)
# ----------------------------------
tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

labels = ["negative", "neutral", "positive"]


# ----------------------------------
# Single Text Sentiment
# ----------------------------------
def analyze_sentiment(text: str):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)
    confidence, predicted_class = torch.max(probs, dim=1)

    return {
        "sentiment": labels[predicted_class.item()],
        "confidence": float(confidence.item())
    }


# ----------------------------------
# Stock-Level Sentiment (Real News)
# ----------------------------------
def analyze_stock_sentiment(symbol: str):
    """
    Fetch real Yahoo Finance headlines,
    run FinBERT on each,
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
            scores.append(0)

    avg_score = sum(scores) / len(scores)

    # Decision thresholds
    if avg_score > 0.2:
        final_sentiment = "positive"
    elif avg_score < -0.2:
        final_sentiment = "negative"
    else:
        final_sentiment = "neutral"

    return {
        "sentiment": final_sentiment,
        "confidence": abs(avg_score),
        "headlines_used": len(headlines)
    }
