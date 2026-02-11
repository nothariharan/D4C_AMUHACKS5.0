import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCAKFN-UK0ZUoMWNHRUPTV3vyGtPuxuKLE";

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    console.log("Testing models...");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} is working.`);
        } catch (e) {
            console.log(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

listModels();
