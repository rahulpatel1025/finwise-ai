// 1. Tell Node to load variables from the .env.local file
require('dotenv').config({ path: '.env.local' });

// 2. Now process.env will successfully pull the key
const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("--- VALID MODELS FOR YOUR KEY ---");
    if (data.models) {
      data.models.forEach(model => {
        // We only care about models that can generate content
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
          console.log(`Model Name: ${model.name.replace("models/", "")}`);
        }
      });
    } else {
      console.error("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

checkModels();