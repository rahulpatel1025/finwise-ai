import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY; // Make sure this is in your .env.local

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
  }

  try {
    const { message } = await request.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Successfully using the Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The System Prompt makes it act like a tutor
    const prompt = `You are the "FINWISE AI Finance Tutor". Your job is to explain financial, investing, and economic concepts to beginners. 
    Keep your answers simple, encouraging, and easy to understand. Use real-world analogies. 
    Do not give direct financial advice to buy specific stocks; only educate.
    
    User's question: ${message}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Tutor Error:", error);
    return NextResponse.json({ error: 'Failed to generate a response' }, { status: 500 });
  }
}