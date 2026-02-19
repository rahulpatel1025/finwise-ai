# advisor_text.py

def generate_advisory_text(symbol: str,
                           predicted_return: float,
                           technical_signal: str,
                           sentiment: str,
                           confidence: float,
                           final_advice: str) -> str:
    """
    Generate human-like advisory explanation
    based on technical + sentiment + confidence.
    """

    confidence_level = ""
    
    if confidence > 0.75:
        confidence_level = "high confidence"
    elif confidence > 0.55:
        confidence_level = "moderate confidence"
    else:
        confidence_level = "low confidence"

    base_statement = (
        f"Based on the latest technical indicators, {symbol} shows a "
        f"{technical_signal.lower()} outlook with a predicted return of "
        f"{round(predicted_return * 100, 2)}%."
    )

    sentiment_statement = (
        f"Recent market sentiment appears {sentiment}, "
        f"with {confidence_level} from analyzed news headlines."
    )

    if final_advice in ["Strong Buy", "Buy"]:
        action_statement = (
            "This alignment between technical momentum and sentiment suggests potential upside opportunity."
        )
    elif final_advice in ["Strong Sell", "Sell"]:
        action_statement = (
            "The combination of technical weakness and sentiment pressure indicates possible downside risk."
        )
    else:
        action_statement = (
            "Mixed signals between technicals and sentiment suggest caution at this stage."
        )

    disclaimer = (
        " Please note this analysis is data-driven and should not be considered financial advice."
    )

    return f"{base_statement} {sentiment_statement} {action_statement}{disclaimer}"
