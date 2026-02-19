import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import joblib

from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error

import tensorflow as tf


# ---------------------------------
# STOCK LIST (UNIVERSAL TRAINING)
# ---------------------------------
STOCKS = [
    "AAPL", "MSFT", "TSLA",
    "AMZN", "GOOG", "META",
    "^NSEI"
]

LOOKBACK = 60


# ---------------------------------
# 1️⃣ Fetch & Feature Engineering
# ---------------------------------
def fetch_data(symbol, period="3y"):

    df = yf.download(symbol, period=period)

    df["Return"] = df["Close"].pct_change()
    df["Momentum_5"] = df["Close"] / df["Close"].shift(5) - 1
    df["Momentum_10"] = df["Close"] / df["Close"].shift(10) - 1
    df["MA10"] = df["Close"].rolling(10).mean()
    df["MA30"] = df["Close"].rolling(30).mean()
    df["Volatility"] = df["Return"].rolling(10).std()

    df["Target"] = df["Return"] / df["Volatility"]
    df["Symbol"] = symbol

    df.dropna(inplace=True)

    return df


# ---------------------------------
# 2️⃣ Prepare Multi-Stock Dataset
# ---------------------------------
def prepare_multi_stock_data():

    print("Fetching multi-stock data...")

    all_data = []

    for stock in STOCKS:
        print(f"Downloading {stock}...")
        df = fetch_data(stock)
        all_data.append(df)

    df_all = pd.concat(all_data)
    df_all.reset_index(drop=True, inplace=True)

    # Encode stock ID
    label_encoder = LabelEncoder()
    df_all["Stock_ID"] = label_encoder.fit_transform(df_all["Symbol"])

    features = [
        "Return",
        "Momentum_5",
        "Momentum_10",
        "MA10",
        "MA30",
        "Volatility",
        "Stock_ID"
    ]

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df_all[features])

    X, y = [], []

    for i in range(LOOKBACK, len(scaled)):
        X.append(scaled[i - LOOKBACK:i])
        y.append(df_all["Target"].values[i])

    X = np.array(X)
    y = np.array(y)

    return X, y, scaler, label_encoder


# ---------------------------------
# 3️⃣ Build Model
# ---------------------------------
def build_model(input_shape):

    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        tf.keras.layers.Dropout(0.3),

        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.3),

        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(1)
    ])

    model.compile(
        optimizer="adam",
        loss=tf.keras.losses.Huber()
    )

    return model


# ---------------------------------
# 4️⃣ Metrics
# ---------------------------------
def evaluate(y_true, y_pred):

    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)

    direction_true = np.sign(y_true)
    direction_pred = np.sign(y_pred)

    directional_accuracy = np.mean(direction_true == direction_pred) * 100

    return rmse, mae, directional_accuracy


# ---------------------------------
# 5️⃣ MAIN
# ---------------------------------
if __name__ == "__main__":

    print("Preparing multi-stock dataset...")
    X, y, scaler, label_encoder = prepare_multi_stock_data()

    print("Splitting dataset...")
    split = int(len(X) * 0.8)

    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print("Building model...")
    model = build_model((X_train.shape[1], X_train.shape[2]))

    early_stop = tf.keras.callbacks.EarlyStopping(
        patience=5,
        restore_best_weights=True
    )

    print("Training...")
    model.fit(
        X_train,
        y_train,
        validation_split=0.1,
        epochs=50,
        batch_size=32,
        callbacks=[early_stop],
        verbose=1
    )

    print("Predicting...")
    preds = model.predict(X_test).flatten()

    rmse, mae, directional_acc = evaluate(y_test, preds)

    print("\n📊 UNIVERSAL LSTM RESULTS")
    print("--------------------------------")
    print(f"RMSE: {rmse:.6f}")
    print(f"MAE : {mae:.6f}")
    print(f"Directional Accuracy: {directional_acc:.2f}%")
    print("--------------------------------")

    # ---------------------------------
    # SAVE MODEL + SCALER + ENCODER
    # ---------------------------------
    print("Saving model artifacts...")

    model.save("universal_lstm_model.h5")
    joblib.dump(scaler, "scaler.save")
    joblib.dump(label_encoder, "label_encoder.save")

    print("✅ Training complete.")
