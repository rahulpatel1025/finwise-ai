export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// -----------------------------
// Helper: Call Python ML API
// -----------------------------
async function getMLPrediction(symbol) {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symbol }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ML prediction");
  }

  return await response.json();
}

// -----------------------------
// Helper: Generate Gemini Explanation
// -----------------------------
async function generateExplanation(mlData) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const riskScore =
    Math.abs(mlData.predicted_return) *
    (1 - mlData.sentiment_confidence);

  const prompt = `
You are a responsible financial analyst AI.

Respond in CLEAR structured format using markdown.

Do NOT write everything in one paragraph.

Use the following sections:

1. 📊 Overview
2. 📈 Technical Analysis
3. 📰 Market Sentiment
4. ⚠️ Risk Assessment
5. 🧠 Final Recommendation
6. 📌 Disclaimer


Stock: ${mlData.symbol}
Predicted Return: ${(mlData.predicted_return * 100).toFixed(2)}%
Technical Signal: ${mlData.technical_signal}
Market Sentiment: ${mlData.sentiment}
Sentiment Confidence: ${(mlData.sentiment_confidence * 100).toFixed(1)}%
Final Advice: ${mlData.final_advice}
Risk Score: ${riskScore.toFixed(3)}

Rules:
- Use bullet points
- Keep paragraphs short
- Make it easy to read
- Sound professional but clear
- Do NOT repeat raw numbers too many times
- Keep explanation concise but insightful

Explain the reasoning behind this recommendation clearly.
Keep it professional, concise, and investor-friendly.
Avoid giving guaranteed financial promises.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return { explanation: text, riskScore };
}

// -----------------------------
// POST Route
// -----------------------------
export async function POST(req) {
  try {
    const { symbol } = await req.json();

    if (!symbol) {
      return Response.json(
        { error: "Symbol is required." },
        { status: 400 }
      );
    }

    // 1️⃣ Call Python ML Service
    const mlData = await getMLPrediction(symbol);

    // 2️⃣ Generate AI Explanation
    const { explanation, riskScore } =
      await generateExplanation(mlData);

    // 3️⃣ Return Full Advisor Response
    return Response.json({
      ...mlData,
      risk_score: riskScore,
      explanation,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Advisor system failed." },
      { status: 500 }
    );
  }
}
