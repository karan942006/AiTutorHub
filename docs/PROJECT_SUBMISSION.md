# AITutorHub: SDG 4 Capstone Project Submission

**Project Name:** AITutorHub  
**Submitting Student:** Sanika Patil  
**Target SDG:** SDG 4 — Quality Education  
**Repository URL:** [Pending Repository Link]  

---

## 1. Selected SDG & Reason for Selection
**SDG 4: Quality Education** aims to ensure inclusive and equitable quality education and promote lifelong learning opportunities for all. 
We selected SDG 4 because access to high-quality tutoring and structured curriculum is highly unequal. Students in low-resource settings, rural areas, and low-income families cannot afford private tutors, test prep materials, or career guidance advisors. By applying client-side generative AI models like Gemini 2.5 Flash, we can offer adaptive tutoring, custom test prep, and customized career guidance for free, leveling the playing field for students worldwide.

---

## 2. Problem Statement
Education is a fundamental human right, yet over **250 million children and youth** are out of school globally, and millions more in school lack basic proficiency in literacy and numeracy due to overcrowded classrooms, undertrained instructors, and lack of personalized support. 

### Core Challenges:
- **Lack of Personal Mentors:** A single teacher in a rural class of 60 students cannot provide personalized feedback or adapt lessons to individual learning paces.
- **Geographic and Economic Barriers:** Quality test prep materials, tutoring services, and career advisors are concentrated in cities and cost substantial tuition fees.
- **Offline Constraints:** Many rural areas suffer from intermittent internet access, preventing students from using streaming-heavy study services.
- **Consequences of Inaction:** If this digital educational divide remains unsolved, generations of youth in underrepresented regions will face limited employment opportunities, exacerbating inequality and trapping communities in cycles of poverty.

---

## 3. Proposed Solution: AITutorHub
**AITutorHub** is a highly accessible, lightweight, and responsive personal AI tutoring platform. By hosting it as a static client-side web application, it loads instantly, works on any modern smartphone or low-spec laptop, and does not require expensive backend infrastructure.

### How it Works:
- **Adaptive Roadmap:** When a student enters their learning goal, the platform generates a custom, scaffolded curriculum divided into modules.
- **Interactive AI Tutor (Text & Voice):** A student can write or speak questions to a patient AI assistant that breaks down explanations step-by-step, writes practice code, and reads responses out loud using text-to-speech.
- **Dynamic Practice Assessments:** Rather than fixed question banks, the AI generates custom multiple-choice quizzes on-demand, evaluates inputs, and highlights areas for improvement.
- **Personalized Schedule Planner:** Converts complex goals (e.g. "prepare for entrance exam in 4 weeks") into structured daily schedules.
- **Career Blueprint Generator:** Analyzes interests and strengths to recommend career fields and specify which topics to study to get started.

---

## 4. Key Project Features
- **AI Voice Tutor (Text + Speech)**: Browser-based speech-to-text input paired with high-fidelity speech synthesis, allowing auditory and conversational learning.
- **AI Quiz Generator**: Produces targeted assessments on any topic, evaluates answers, calculates scores, and explains mistakes.
- **AI Study Goal Planner**: Creates detailed calendars specifying daily reading topics and exercises based on selected durations.
- **AI Career Guidance Compass**: Suggests career opportunities and provides recommended learning paths based on skills and interest questionnaires.
- **Gamification Engine**: Keeps students engaged by awarding XP, tracking levels, keeping daily streaks, and awarding badges for milestones.
- **Discussion Board**: A forum matching topics to courses where students can collaborate, post replies, and upvote constructive discussions.
- **Global Leaderboard**: Promotes healthy competition by ranking students based on cumulative study XP.

---

## 5. Technology Stack
- **Structure:** Semantic HTML5
- **Design System:** Custom CSS3 with custom variables, responsive grid, flexbox layout, and glassmorphic aesthetics.
- **Logic:** Vanilla ES6+ JavaScript (SPA router, state persistence, event handling).
- **Core AI Engine:** Google Gemini 2.5 Flash API (invoked client-side).
- **Assets & Icons:** Lucide Icons (loaded via CDN), Poppins and Inter fonts (loaded via Google Fonts CDN).
- **Deployment:** GitHub Pages (automated via GitHub Actions).

---

## 6. Interface Screenshots & Captions
*(Replace placeholders with actual screenshots prior to exporting to PDF)*

- **[Home Page]**: Showcase of the SDG 4 hero banner, interactive CTA buttons, and feature list.
- **[Student Dashboard]**: Display of current level, XP, badge grid, performance predictions, and adaptive learning timeline.
- **[AI Chat & Voice Tutor]**: A transcription of the voice-enabled AI tutor explaining a science concept step-by-step.
- **[Quiz Assessment]**: Active quiz page showing a multiple-choice question layout and final score review page.
- **[Study Goal Calendar]**: A weekly calendar view generated by Gemini outlining custom topic breakdowns.
- **[Career Guidance results]**: Cards recommending specific engineering or scientific careers along with learning plans.
- **[Community Discussion Board]**: The discussion board displaying active student question threads and replies.
- **[Leaderboard View]**: Rankings showcasing student progress comparison.

---

## 7. Future Scope
1. **Adaptive ML Difficulty Tuning**: Upgrade the analytics widget into a local machine learning classifier (e.g., using TensorFlow.js) that adjusts quiz difficulty automatically based on historical speed and correctness.
2. **Local Syncing & Full Offline-First Sync**: Introduce PWA service workers for offline caching of lesson materials and a local SQLite database (for mobile) that queues quiz results to sync with Supabase when internet reconnects.
3. **Multi-Language UI Translations**: Seamless translation of UI elements and generated AI responses into regional dialects (e.g., Hindi, Spanish, Swahili) using the LLM translator.
4. **Teacher approval and Moderation Dashboard**: Add an admin/teacher role tier allowing local instructors to post courses, schedule live Jitsi classrooms, and oversee student growth charts.
