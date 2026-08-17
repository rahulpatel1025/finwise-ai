import os
import sys
from contextlib import asynccontextmanager

if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

try:
    from .advisor_text import generate_advisory_text
    from .model import run_lstm_prediction, load_model_from_disk
    from .sentiment import analyze_sentiment
    from .fusion import fusion_engine
    from .news_scraper import get_stock_headlines
except ImportError:
    from advisor_text import generate_advisory_text
    from model import run_lstm_prediction, load_model_from_disk
    from sentiment import analyze_sentiment
    from fusion import fusion_engine
    from news_scraper import get_stock_headlines


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load LSTM model artifacts gracefully on startup
    try:
        load_model_from_disk()
    except Exception as e:
        print(f"Warning: Could not pre-load LSTM model on startup: {e}")
    yield


app = FastAPI(
    title="FinWise ML Advisory Service",
    description="Multi-Modal Financial Advisory API combining LSTM Technical Forecasting and Market Sentiment",
    version="1.0.0",
    lifespan=lifespan
)

# -----------------------------
# CORS Middleware
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Health Check Endpoints
# -----------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "FinWise AI ML Engine",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "healthy": True}


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
    symbol = data.symbol.strip().upper()
    if not symbol:
        raise HTTPException(status_code=400, detail="Stock symbol is required.")

    try:
        # 1️⃣ Technical Prediction (LSTM)
        lstm_result = run_lstm_prediction(symbol)
        predicted_return = lstm_result["predicted_return"]
        technical_signal = lstm_result["technical_signal"]
    except Exception as e:
        print(f"Technical prediction error for {symbol}: {e}")
        predicted_return = 0.005
        technical_signal = "Neutral"

    try:
        # 2️⃣ Real News Scraping & Sentiment Analysis
        headlines = get_stock_headlines(symbol)
    except Exception as e:
        print(f"News scraper error for {symbol}: {e}")
        headlines = []

    sentiment_score = 0.0
    confidence_sum = 0.0

    for headline in headlines:
        try:
            result = analyze_sentiment(headline)
            if result["sentiment"] == "positive":
                sentiment_score += result["confidence"]
            elif result["sentiment"] == "negative":
                sentiment_score -= result["confidence"]
            confidence_sum += result["confidence"]
        except Exception:
            continue

    if confidence_sum > 0 and len(headlines) > 0:
        avg_confidence = round(confidence_sum / len(headlines), 3)
        if sentiment_score > 0.1:
            sentiment = "positive"
        elif sentiment_score < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"
    else:
        sentiment = "neutral"
        avg_confidence = 0.5

    # 3️⃣ Fusion Engine
    final_advice = fusion_engine(
        predicted_return,
        sentiment,
        avg_confidence
    )

    # 4️⃣ Advisory Text
    advisory_text = generate_advisory_text(
        symbol,
        predicted_return,
        technical_signal,
        sentiment,
        avg_confidence,
        final_advice
    )

    # 5️⃣ Response
    return {
        "symbol": symbol,
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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
