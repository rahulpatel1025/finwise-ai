import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function getStockPrice(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);

    return {
      name: quote.longName,
      price: quote.regularMarketPrice,
      currency: quote.currency,
    };
  } catch (error) {
    console.log("YAHOO ERROR:", error);
    return { error: "Invalid stock symbol" };
  }
}
