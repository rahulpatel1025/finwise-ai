# fusion.py

def technical_score(predicted_return: float) -> float:
    """
    Convert LSTM predicted return into weighted technical score.
    """

    if predicted_return > 0.5:
        return 2
    elif predicted_return > 0.1:
        return 1
    elif predicted_return < -0.5:
        return -2
    elif predicted_return < -0.1:
        return -1
    else:
        return 0


def sentiment_score(sentiment: str, confidence: float) -> float:
    """
    Convert sentiment output into weighted score using confidence.
    """

    if sentiment == "positive":
        return 1 * confidence
    elif sentiment == "negative":
        return -1 * confidence
    else:
        return 0


def fusion_engine(predicted_return: float, sentiment: str, confidence: float) -> str:
    """
    Combine technical + sentiment scores to generate final advisory signal.
    """

    tech = technical_score(predicted_return)
    sent = sentiment_score(sentiment, confidence)

    final_score = tech + sent

    if final_score >= 2:
        return "Strong Buy"
    elif final_score >= 1:
        return "Buy"
    elif final_score <= -2:
        return "Strong Sell"
    elif final_score <= -1:
        return "Sell"
    else:
        return "Hold"
