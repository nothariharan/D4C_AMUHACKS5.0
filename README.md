# JustAsk - Goal First. Action Always.

![JustAsk Logo](/app/public/logo.png)

> **"Every expert was once a beginner. The best time to start was yesterday. The next best time is now."**

JustAsk is a brutalist, no-nonsense career roadmap generator and mentorship platform powered by AI. It helps you define a goal, identifies your skill gaps, and generates a custom "Metro Map" learning path to take you from zero to hired.

## 🚀 Features

- **🎯 Goal Parsing**: Enter any career goal (e.g., "Become a React Developer"). The AI analyzes it and structures a valid role.
- **🗺️ Metro Map Visualization**: A non-linear, interactive roadmap visualization that looks like a subway map.
- **⚡ Gap Analysis**: A binary "Tech/No" assessment to tailor the roadmap to your existing knowledge.
- **🔥 Gamification**:
    - **Streaks & Heatmaps**: Track your daily activity.
    - **Daily Rituals**: Small, consistent tasks to build momentum.
    - **The Gauntlet**: A high-stakes capstone challenge to prove your mastery.
- **🤖 AI Mentorship**: Get instant explanations, code snippets, and guidance for any task on your roadmap.
- **📦 Shipping Manifest**: A brutalist resume/portfolio generated from your verified progress.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS v4, Framer Motion (Animations)
- **State Management**: Zustand
- **Backend/Auth**: Firebase (Auth, Firestore)
- **AI**: OpenRouter (Google Gemini / Various Models)
- **Icons**: Lucide React

## 🔑 Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/JustAsk.git
    cd JustAsk/app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `app/` directory. You can optionally add your API key here, but the app also supports entering it via the UI.
    ```env
    VITE_OPENROUTER_API_KEY=your_openrouter_key_here  # Optional
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## 🗝️ API Key Configuration

To use the AI features, you need an **OpenRouter API Key**.
- If you don't provide one in the `.env` file, the application will prompt you to enter one securely upon launch.
- The key is stored locally in your browser (`localStorage`) and is never sent to our servers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
