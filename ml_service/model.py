# model.py

import os
import numpy as np
import tensorflow as tf
import joblib

from lstm_model import fetch_data, LOOKBACK

MODEL_PATH = "universal_lstm_model.h5"
SCALER_PATH = "scaler.save"
ENCODER_PATH = "label_encoder.save"

model = None
scaler = None
label_encoder = None


# -------------------------------------------------
# 1️⃣ Load Model + Scaler + Encoder
# -------------------------------------------------
def load_model_from_disk():

    global model, scaler, label_encoder

    print("Loading Universal LSTM model...")

    model = tf.keras.models.load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)

    print("Model loaded successfully.")


# -------------------------------------------------
# 2️⃣ Prepare Live Input For Any Stock
# -------------------------------------------------
def prepare_live_data(symbol):

    df = fetch_data(symbol)

    df["Stock_ID"] = label_encoder.transform([symbol])[0]

    features = [
        "Return",
        "Momentum_5",
        "Momentum_10",
        "MA10",
        "MA30",
        "Volatility",
        "Stock_ID"
    ]

    df.dropna(inplace=True)

    scaled = scaler.transform(df[features])

    if len(scaled) < LOOKBACK:
        raise ValueError("Not enough data for prediction")

    latest_sequence = scaled[-LOOKBACK:]

    return latest_sequence.reshape(1, LOOKBACK, len(features))


# -------------------------------------------------
# 3️⃣ Run Prediction (Universal)
# -------------------------------------------------
def run_lstm_prediction(symbol="AAPL"):

    global model

    if model is None:
        load_model_from_disk()

    latest_input = prepare_live_data(symbol)

    prediction = model.predict(latest_input)

    predicted_return = float(prediction[0][0])

    # Signal logic
    if predicted_return > 0.002:
        signal = "Bullish"
    elif predicted_return < -0.002:
        signal = "Bearish"
    else:
        signal = "Neutral"

    return {
        "symbol": symbol,
        "predicted_return": predicted_return,
        "technical_signal": signal
    }
