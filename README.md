# Oracle AI — AI-Powered Interview Intelligence Platform 🚀

Oracle AI is a state-of-the-art, multi-modal intelligence platform designed to analyze and enhance interview performance. It leverages advanced AI to provide real-time insights into emotions, communication clarity, and candidate suitability.

![Oracle AI Preview](https://github.com/Ayushkr2736/Future_AI/raw/main/frontend/public/preview.png) *(Note: Add your own screenshot here)*

## ✨ Key Features

- **🧠 Multi-Modal Analysis**: Combines facial emotion recognition, voice transcription, and text analysis.
- **💬 Intelligent Chat**: Real-time interaction powered by Google Gemini AI.
- **🎭 Face & Emotion Tracking**: Analyzes confidence, motivation, and emotional stability via webcam.
- **🎙️ Voice Intelligence**: Transcribes audio and analyzes speech patterns for clarity and tone.
- **📊 Performance Dashboard**: Detailed metrics and Success Prediction Scores.
- **📄 Automated Reports**: Generates comprehensive post-session PDF/JSON reports.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn, Motor (Async MongoDB).
- **AI/ML**: Google Gemini Pro (Generative AI), MediaPipe (Face Analysis).
- **Database**: MongoDB Atlas.

## 🚀 Getting Started

### 1. Prerequisite
- Python 3.9+
- Node.js 18+
- MongoDB Atlas Account
- Google AI Studio API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with GEMINI_API_KEY and MONGODB_URI
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create a .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## 🏗️ Deployment

For deployment instructions, please refer to the [Deployment Guide](./brain/deployment_guide.md) or follow the standard procedures for Vercel (Frontend) and Render (Backend).

## 📄 License
MIT License - Copyright (c) 2024 Ayush Kumar

---
*Built with ❤️ for the future of AI-driven recruitment.*
