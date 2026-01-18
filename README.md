# NewLanguage - AI Speaking Coach

> **"newLanguage is an AI-powered personal language tutor that replaces scripted lessons with unscripted, real-time voice conversations and instant feedback."**

## Inspiration
We’ve all been there: you spend months on language apps learning vocabulary, but when it’s time to actually speak to a local, you freeze. The gap between *knowing* words and *using* them in conversation is huge. We built **newLanguage** to bridge that gap. We wanted to create a **"Judgment-Free Zone"** where learners can practice speaking loudly, make mistakes, and get corrected instantly without the embarrassment of stumbling in front of a real person.

## What it does
newLanguage is an immersive AI voice coach that lives in your browser.
1.  **Listens**: You speak naturally into your microphone.
2.  **Analyzes**: The AI transcribes your speech and instantly checks your grammar, vocabulary, and tone.
3.  **Corrects**: If you make a mistake (e.g., *"I want go store"*), it pop-ups a helpful "Tip" (*"Try saying: I want to go to the store"*).
4.  **Responds**: It replies in a hyper-realistic human voice, keeping the conversation going in scenarios like **Job Interviews**, **Ordering Coffee**, or **Travel Directions**.

## How we built it
We adopted a **dual-architecture** approach, prioritizing speed and user experience:

-   **Frontend (The Brains - Direct AI)**: Built with **React 19 (Vite)** and **TypeScript**. We engineered the core AI logic to run **directly in the client (`fe/src/services/ai.ts`)** to minimize latency.
    -   **Direct API Integration**: By calling OpenAI and ElevenLabs directly from the frontend, we reduced response times significantly, making the conversation feel natural and snappy.
    -   **Speech-to-Text**: Uses OpenAI Whisper (via API) and the Web Speech API for hybrid accuracy.
    -   **Intelligence**: GPT-4o powers the conversation and the "Teacher" persona that detects errors.
    -   **Voice**: Integrated **ElevenLabs** API for ultra-realistic text-to-speech.
    -   **UI**: Designed a custom **Glassmorphism** interface using **TailwindCSS 4**.

-   **Backend (The Foundation)**: A **Python FastAPI** service designed to provide a robust infrastructure.
    -   **Scalability**: The Python backend handles authentication, user session persistence, and advanced data modeling.
    -   **Security**: Serving as the secure gateway for future API interactions and keeping sensitive logic protected.
    -   **Advanced Analytics**: Capable of processing heavy linguistic data that would be too intensive for the browser.

## Challenges we ran into
-   **Latency vs. Realism**: Routing audio through a backend server initially added too much delay, killing the "conversational" vibe. We pivoted to direct client-side API calls to shave off precious milliseconds.
-   **Safari vs. Chrome**: The Web Speech API behaves differently across browsers. We had to implement fallback logic to ensure the microphone worked consistently.
-   **Prompt Engineering**: getting the AI to be a "helpful tutor" rather than just a "chatbot" was tricky. We had to fine-tune the system prompts to ensure it corrects mistakes *gently* without interrupting the flow.

## Accomplishments that we're proud of
-   **The "Active Feedback Loop"**: It actually works! Seeing the AI catch a grammar mistake in real-time feels magical.
-   **Premium UI**: We moved away from standard Bootstrap/Material looks to create a custom, animated interface (like our new Language Selector) that feels like a native app.
-   **Hybrid Architecture**: Successfully designing a system that uses frontend AI for speed while maintaining a Python backend for robustness.

## What we learned
-   **Voice UI is Hard**: Visual interfaces wait for clicks; Voice interfaces have to handle silence, interruptions, and background noise.
-   **TypeScript is King**: Moving our logic to strict TypeScript saved us from countless bugs when handling complex JSON responses from the AI.

## What's next for newLanguage
-   **User Accounts**: Fully integrating the Python backend to save user progress and vocabulary lists permanently.
-   **Gamification**: Adding streaks and daily goals.
-   **More Scenarios**: Adding "Medical Emergency", "First Date", and "Business Negotiation" modules.

---

## 🛠 Tech Stack & Setup

### Frontend (`/fe`)
**Main Logic Hub**: Handles OpenAI/ElevenLabs interactions directly for speed.
```bash
cd fe
npm install
npm run dev
```

### Backend (`/be`)
**Foundation**: FastAPI service for infrastructure and scaling.
```bash
cd be
pip install -r requirements.txt
python main.py
```

## 🔑 Environment Variables
You need an `.env` file with:
- `VITE_OPENAI_API_KEY`
- `VITE_ELEVENLABS_API_KEY`
