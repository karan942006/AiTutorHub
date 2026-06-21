# AITutorHub — AI-Powered Personalized Learning Platform

### SDG 4: Quality Education — Personalized Adaptive Learning Platform

AITutorHub is an educational web application designed to support **UN SDG 4: Quality Education**. The platform provides students in under-resourced, rural, or underserved areas with access to structured learning pathways, a voice-enabled personal AI tutor, dynamic quiz generation, adaptive study planning, and career path alignment.

The application is built to run entirely in the browser (client-side), ensuring it can be deployed for free on static hosting sites like **GitHub Pages** and accessed on mobile and desktop viewports.

---

## 🌟 Key Features

1. **AI Voice Tutor**: Dialogue with an AI tutor that explains complex concepts step-by-step. Features browser-based Speech Recognition (microphone input) and Speech Synthesis (voice output).
2. **Adaptive Learning Path**: Input your subject of interest, and the AI generates a customized 4-module progressive roadmap to guide your studies.
3. **Dynamic AI Quiz Generator**: Generate custom quizzes on any topic, difficulty, and question length. The AI constructs the questions, tracks your score, and provides detailed feedback.
4. **AI Study Planner**: Define your learning goal and timeframe to generate a tailored day-by-day study calendar.
5. **Career Guidance Compass**: Take an interactive assessment analyzed by AI to map out your matching career blueprints and recommended study subjects.
6. **Gamification & Rewards**: Earn XP, level up, and unlock achievements/badges (e.g. perfect quizzes, streaks) as you study.
7. **Community Forums**: A per-subject discussion board where users can post threads, ask questions, share answers, and upvote constructive replies.
8. **Global Leaderboard**: A ranking dashboard comparing your XP with other learners globally to keep engagement high.

---

## 🚀 Getting Started

Since AITutorHub is static, you don't need to compile or run servers.

### Run Locally
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd AiTutorHub
   ```
2. Double-click `index.html` to open it directly in your web browser, or serve it using a local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

### Input your Gemini API Key
To power the AI components, you will need a Gemini API Key:
1. Click **Gemini API Key** in the bottom-left sidebar.
2. Enter your API key (starts with `AIzaSy`).
3. Click **Save Credentials**.
*Your API key is saved securely in your browser's local storage and is never sent to any external server other than the Google Gemini API endpoint.*

---

## 📦 Deployment to GitHub Pages

The repository includes a automated GitHub Action workflow under [.github/workflows/deploy.yml](.github/workflows/deploy.yml) that deploys the application:
1. Create a new repository on GitHub.
2. Commit and push your code to the `main` or `master` branch.
3. Go to your repository **Settings** -> **Pages**.
4. Set **Source** to `Deploy from a branch` and select the `pages` branch.
5. Save, and your site will be live at `https://<your-username>.github.io/<your-repo-name>/`.
