# NewLanguage - AI Speaking Coach

A modern web application designed to help language learners practice speaking confidently. The app features an AI Coach that provides real-time feedback on grammar, vocabulary, and tone, along with conversational practice.

## 🚀 Features

- **Real-time Voice Practice**: Speak directly to the AI using your microphone (Web Speech API).
- **Instant AI Feedback**: Get immediate corrections and tips on your grammar and sentence structure.
- **Conversational AI**: Engage in natural, text, or voice-based conversations with an AI personality.
- **Session History**: Tracks your progress and saves past practice sessions.
- **Dual Architecture**:
  - **Frontend**: Responsive React app with direct AI integration for low latency.
  - **Backend**: Python FastAPI service for advanced text analysis and Text-to-Speech (ElevenLabs).

## 🛠 Tech Stack

### Frontend (`/fe`)
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **Speech**: Browser built-in Web Speech API
- **State**: React Hooks + LocalStorage Persistence

### Backend (`/be`)
- **Framework**: FastAPI (Python)
- **AI Integration**: OpenAI API
- **TTS**: ElevenLabs API
- **Storage**: JSON-based local storage

---

## 🏁 Getting Started

### 1. Frontend Setup
The frontend is the main interface where you practice speaking.

```bash
cd fe

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env.local
# Edit .env.local and add your VITE_OPENAI_API_KEY
```

**Run the Frontend:**
```bash
npm run dev
```
Access at: `http://localhost:5173`

### 2. Backend Setup
The backend provides advanced analytics and high-quality voice synthesis.

```bash
cd be

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
cp .env.example .env
# Edit .env and add:
# - OPENAI_API_KEY
# - ELEVENLABS_API_KEY
```

**Run the Backend:**
```bash
python main.py
# OR using uvicorn directly:
uvicorn main:app --reload
```
Access API Docs at: `http://localhost:8000/docs`

## 🔑 Environment Variables

### Frontend (`fe/.env.local`)
| Variable | Description |
|----------|-------------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API Key for direct client-side feedback. |

### Backend (`be/.env`)
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI Key for backend analysis. |
| `ELEVENLABS_API_KEY` | Keys for generating high-quality AI voices. |
| `ELEVENLABS_VOICE_ID`| Specific voice ID to use (Configurable). |

## 📝 Usage
1. Open the frontend in your browser.
2. Allow microphone access when prompted.
3. Click the **Microphone** button to start speaking.
4. Say a sentence (e.g., *"I want go to the station."*).
5. Click **Stop** or wait for silence.
6. The AI will respond conversationally and provide a "Tip" pop-up if it detects errors.
