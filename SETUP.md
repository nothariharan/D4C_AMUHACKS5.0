# Just Ask - Setup Guide 🚀

## 1. Installation
The main application code is located in the `app` folder, not the root.

Open your terminal in this project folder and run:

```bash
cd app
npm install
```

## 2. Environment Variables 🔑
**Critical:** You need an API key for the AI features to work.

1.  Create a file named `.env` inside the `app/` folder.
2.  Add your OpenRouter/Gemini API key:

```env
VITE_OPENROUTER_API_KEY=your_api_key_here
```

## 3. Running the App 🏃‍♂️
Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`.
