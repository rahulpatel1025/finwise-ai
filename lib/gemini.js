
export const runtime = "nodejs";

export async function askGemini(prompt) {
  // ✅ Updated to use the model explicitly found in your list
  // ✅ Switched to 'v1beta' which is often required for newer models
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await res.json();
  console.log("GEMINI RAW:", JSON.stringify(data, null, 2));

  // 1. Handle API Errors (like Quota or 404)
  if (data.error) {
    throw new Error(`Gemini API Error: ${data.error.message}`);
  }

  // 2. Validate Candidates
  if (!data.candidates || !data.candidates.length) {
    throw new Error("Gemini returned no candidates");
  }

  const content = data.candidates[0].content;

  // 3. 🔥 Handle BOTH response formats safely
  if (content.parts && content.parts.length && content.parts[0].text) {
    return content.parts[0].text;
  }

  if (content.text) {
    return content.text;
  }

  throw new Error("Unknown Gemini response format");
}