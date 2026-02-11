import fs from "fs";

const API_KEY = "AIzaSyCAKFN-UK0ZUoMWNHRUPTV3vyGtPuxuKLE";
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function fetchModels() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        fs.writeFileSync("models_list.json", JSON.stringify(data, null, 2));
        console.log("Models list saved to models_list.json");
    } catch (error) {
        console.error("Error fetching models:", error);
        fs.writeFileSync("models_list.json", JSON.stringify({ error: error.message }));
    }
}

fetchModels();
