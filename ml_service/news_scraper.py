import requests
from bs4 import BeautifulSoup


def get_stock_headlines(symbol: str, limit: int = 5):
    """
    Fetch latest Yahoo Finance news headlines for a stock symbol.
    """

    url = f"https://finance.yahoo.com/quote/{symbol}?p={symbol}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    headlines = []

    for item in soup.find_all("h3"):
        text = item.get_text(strip=True)
        if text and len(text) > 20:
            headlines.append(text)

    return headlines[:limit]
