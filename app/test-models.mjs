import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCAKFN-UK0ZUoMWNHRUPTV3vyGtPuxuKLE";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    console.log("Testing models for API Key...");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} is WORKING.`);
        } catch (e) {
            console.log(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

listModels();
