export const runtime = "nodejs";

import { askGemini } from "@/lib/gemini";
import { buildPrompt } from "../../../lib/prompt";
import { getStockPrice } from "../../../lib/yahooFinance";

// very simple intent detector
function detectIntent(message) {
  const text = message.toLowerCase();

  const greetings = ["hi", "hello", "hey", "how are you"];
  const financeWords = [
    "stock",
    "share",
    "price",
    "market",
    "invest",
    "finance",
    "inflation",
    "interest",
    "earnings",
    "company",
    "apple",
    "tesla",
    "nifty",
    "sensex",
  ];

  if (greetings.some((g) => text.includes(g))) return "greeting";
  if (financeWords.some((w) => text.includes(w))) return "finance";

  return "other";
}

export async function POST(req) {
  const { message, symbol } = await req.json();

  const intent = detectIntent(message);

  // 1️⃣ Greeting case
  if (intent === "greeting") {
    const reply = await askGemini(
      `User said: "${message}". Reply in a friendly conversational way.`
    );
    return Response.json({ reply });
  }

  // 2️⃣ Non-finance junk
  if (intent === "other") {
    return Response.json({
      reply:
        "Please ask questions related to stocks, finance, or the market 📈",
    });
  }

  // 3️⃣ Real finance / stock case
  const marketData = await getStockPrice(symbol || "AAPL");

  const prompt = buildPrompt(message, marketData);

  const reply = await askGemini(prompt);

  return Response.json({ reply });
}