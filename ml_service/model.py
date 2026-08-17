# model.py

import os
import sys
import numpy as np
import tensorflow as tf
import joblib

try:
    from .lstm_model import fetch_data, build_model, LOOKBACK
except ImportError:
    try:
        from lstm_model import fetch_data, build_model, LOOKBACK
    except ImportError:
        LOOKBACK = 60
        def build_model(input_shape=(60, 7)):
            model = tf.keras.Sequential([
                tf.keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
                tf.keras.layers.Dropout(0.3),
                tf.keras.layers.LSTM(32),
                tf.keras.layers.Dropout(0.3),
                tf.keras.layers.Dense(16, activation="relu"),
                tf.keras.layers.Dense(1)
            ])
            model.compile(optimizer="adam", loss="huber")
            return model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "universal_lstm_model.h5")
SAVED_MODEL_PATH = os.path.join(BASE_DIR, "saved_lstm_model.h5")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.save")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.save")

model = None
scaler = None
label_encoder = None


# -------------------------------------------------
# 1️⃣ Load Model + Scaler + Encoder
# -------------------------------------------------
def load_model_from_disk():
    global model, scaler, label_encoder

    if model is not None and scaler is not None and label_encoder is not None:
        return

    print("Loading Universal LSTM model and preprocessing artifacts...")

    target_model_path = MODEL_PATH if os.path.exists(MODEL_PATH) else SAVED_MODEL_PATH

    if os.path.exists(target_model_path):
        try:
            model = tf.keras.models.load_model(target_model_path, compile=False)
        except Exception as e:
            print(f"Standard load failed ({e}), loading via build_model + load_weights...")
            try:
                model = build_model((LOOKBACK, 7))
                model.load_weights(target_model_path)
            except Exception as e2:
                print(f"Weight loading failed: {e2}")
                model = None
    else:
        print(f"Warning: Model file not found at {target_model_path}")

    if os.path.exists(SCALER_PATH):
        try:
            scaler = joblib.load(SCALER_PATH)
        except Exception as e:
            print(f"Warning: Could not load scaler: {e}")
            scaler = None

    if os.path.exists(ENCODER_PATH):
        try:
            label_encoder = joblib.load(ENCODER_PATH)
        except Exception as e:
            print(f"Warning: Could not load label encoder: {e}")
            label_encoder = None

    print("Model artifacts initialization finished.")


# -------------------------------------------------
# 2️⃣ Prepare Live Input For Any Stock
# -------------------------------------------------
def prepare_live_data(symbol):
    global model, scaler, label_encoder

    if scaler is None or label_encoder is None:
        load_model_from_disk()

    df = fetch_data(symbol)

    if df is None or len(df) == 0:
        raise ValueError(f"Could not fetch historical data for symbol '{symbol}'")

    try:
        df["Stock_ID"] = label_encoder.transform([symbol])[0]
    except Exception:
        # Default Stock_ID for ticker symbols not in original training set
        df["Stock_ID"] = 0

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

    if len(df) < LOOKBACK:
        raise ValueError(f"Not enough historical data ({len(df)} rows) for prediction. Minimum {LOOKBACK} needed.")

    if scaler is not None:
        scaled = scaler.transform(df[features])
    else:
        # Fallback normalization if scaler missing
        raw_vals = df[features].values
        scaled = (raw_vals - np.mean(raw_vals, axis=0)) / (np.std(raw_vals, axis=0) + 1e-7)

    latest_sequence = scaled[-LOOKBACK:]
    return latest_sequence.reshape(1, LOOKBACK, len(features))


# -------------------------------------------------
# 3️⃣ Run Prediction (Universal)
# -------------------------------------------------
def run_lstm_prediction(symbol="AAPL"):
    global model

    if model is None:
        load_model_from_disk()

    if model is None:
        return {
            "symbol": symbol,
            "predicted_return": 0.005,
            "technical_signal": "Neutral"
        }

    latest_input = prepare_live_data(symbol)
    prediction = model.predict(latest_input, verbose=0)
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
