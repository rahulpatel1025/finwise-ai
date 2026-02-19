from advisor_text import generate_advisory_text
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from model import run_lstm_prediction, load_model_from_disk
from sentiment import analyze_sentiment
from fusion import fusion_engine
from news_scraper import get_stock_headlines 

app = FastAPI()


# -----------------------------
# Load LSTM Model Once
# -----------------------------
@app.on_event("startup")
def startup_event():
    load_model_from_disk()


# -----------------------------
# Request Schema
# -----------------------------
class StockRequest(BaseModel):
    symbol: str


# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict_stock(data: StockRequest):

    # 1️⃣ Technical Prediction (LSTM)
    lstm_result = run_lstm_prediction(data.symbol)
    predicted_return = lstm_result["predicted_return"]
    technical_signal = lstm_result["technical_signal"]

    # 2️⃣ Real News Scraping
    headlines = get_stock_headlines(data.symbol)

    sentiment_score = 0
    confidence_sum = 0

    for headline in headlines:
        result = analyze_sentiment(headline)

        if result["sentiment"] == "positive":
            sentiment_score += result["confidence"]
        elif result["sentiment"] == "negative":
            sentiment_score -= result["confidence"]

        confidence_sum += result["confidence"]

    if confidence_sum > 0 and len(headlines) > 0:
        avg_confidence = confidence_sum / len(headlines)

        if sentiment_score > 0:
            sentiment = "positive"
        elif sentiment_score < 0:
            sentiment = "negative"
        else:
            sentiment = "neutral"
    else:
        sentiment = "neutral"
        avg_confidence = 0

    # 3️⃣ Fusion Engine
    final_advice = fusion_engine(
        predicted_return,
        sentiment,
        avg_confidence
    )
    # 4️⃣ Advisory Text
    advisory_text = generate_advisory_text(
        data.symbol,
        predicted_return,
        technical_signal,
        sentiment,
        avg_confidence,
        final_advice
    )

    # 4️⃣ Response
    return {
        "symbol": data.symbol,
        "predicted_return": predicted_return,
        "technical_signal": technical_signal,
        "sentiment": sentiment,
        "sentiment_confidence": avg_confidence,
        "headlines_used": len(headlines),
        "headlines": headlines,
        "advisory_text": advisory_text,
        "final_advice": final_advice
    }


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
