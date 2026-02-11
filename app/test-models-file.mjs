import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const API_KEY = "AIzaSyCAKFN-UK0ZUoMWNHRUPTV3vyGtPuxuKLE";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    let log = "Testing models for API Key...\n";

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            log += `✅ ${modelName} is WORKING.\n`;
        } catch (e) {
            log += `❌ ${modelName} failed: ${e.message}\n`;
        }
    }

    fs.writeFileSync("output_log.txt", log);
}

listModels();
