export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// -----------------------------
// Helper: Call Python ML API
// -----------------------------
async function getMLPrediction(symbol) {
  const mlBaseUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

  // 12s timeout controller to prevent Lambda / Serverless timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${mlBaseUrl.replace(/\/$/, "")}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ML service responded with HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[Advisor] Python ML service unreachable (${mlBaseUrl}):`, error.message);
    return null;
  }
}

// -----------------------------
// Helper: Generate Gemini Explanation from ML Data
// -----------------------------
async function generateExplanation(data) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const predictedReturnPercent = (data.predicted_return * 100).toFixed(2);
  const confidencePercent = (data.sentiment_confidence * 100).toFixed(1);
  const riskScore =
    Math.abs(data.predicted_return) * (1 - data.sentiment_confidence);

  const prompt = `
You are a responsible, elite financial analyst AI for FinWise.

Respond in a CLEAR, structured format using markdown.

Use the following sections:
1. 📊 Overview
2. 📈 Technical Analysis
3. 📰 Market Sentiment
4. ⚠️ Risk Assessment
5. 🧠 Final Recommendation
6. 📌 Disclaimer

Asset Data:
- Stock: ${data.symbol}
- Forecasted Return: ${predictedReturnPercent}%
- Technical Signal: ${data.technical_signal}
- Market Sentiment: ${data.sentiment}
- Sentiment Confidence: ${confidencePercent}%
- Final Advice: ${data.final_advice}
- Calculated Risk Score: ${riskScore.toFixed(3)}
${data.headlines && data.headlines.length > 0 ? `- Recent Headlines: ${data.headlines.slice(0, 3).join("; ")}` : ""}

Guidelines:
- Use bullet points and clean headers
- Keep paragraphs concise, professional, and actionable
- Explain clearly how the technical momentum and market sentiment justify the "${data.final_advice}" recommendation
- Maintain a balanced tone; avoid guaranteeing future financial returns.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return { explanation: text, riskScore };
}

// -----------------------------
// Fallback: Direct AI Financial Analysis
// (Used when Render ML backend is starting up or unreachable)
// -----------------------------
async function generateDirectAnalysis(symbol) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a top-tier financial analyst AI for FinWise.

Provide a comprehensive, real-time investment analysis for stock ticker "${symbol}".

Respond strictly in markdown with the following structure:
1. 📊 Overview
2. 📈 Technical Outlook
3. 📰 Market Sentiment & Catalysts
4. ⚠️ Risk Assessment
5. 🧠 Recommendation (Strong Buy / Buy / Hold / Sell / Strong Sell)
6. 📌 Disclaimer

Rules:
- Professional, concise, easy to read with bullet points
- Realistic technical indicators (RSI, moving averages, support/resistance context)
- Clear risk factors
- Disclaimer that this is AI research, not fiduciary financial advice
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    symbol,
    predicted_return: 0.05,
    technical_signal: "Neutral",
    sentiment: "neutral",
    sentiment_confidence: 0.7,
    headlines_used: 0,
    headlines: [],
    final_advice: "Hold",
    risk_score: 0.015,
    explanation: text,
    is_fallback: true,
  };
}

// -----------------------------
// POST Route
// -----------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    const symbol = body?.symbol;

    if (!symbol || !symbol.trim()) {
      return Response.json(
        { error: "Valid stock symbol is required." },
        { status: 400 }
      );
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    // 1️⃣ Try Calling Python ML Service on Render / Local
    const mlData = await getMLPrediction(cleanSymbol);

    if (mlData && mlData.predicted_return !== undefined) {
      // 2️⃣ Generate AI Explanation from ML output
      const { explanation, riskScore } = await generateExplanation(mlData);

      return Response.json({
        ...mlData,
        risk_score: riskScore,
        explanation,
      });
    }

    // 3️⃣ Graceful Fallback if ML Service is asleep/offline or ML_SERVICE_URL not yet configured
    console.log(`[Advisor] Generating direct AI analysis for ${cleanSymbol}`);
    const fallbackData = await generateDirectAnalysis(cleanSymbol);
    return Response.json(fallbackData);

  } catch (error) {
    console.error("[Advisor API Error]:", error);
    return Response.json(
      { error: error.message || "Unable to process advisory request." },
      { status: 500 }
    );
  }
}
