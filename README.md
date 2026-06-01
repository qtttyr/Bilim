# Bilim — AI-Powered Smart Study Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

**Bilim** (from Turkic *"knowledge"*) transforms any study material — PDFs, lecture notes, web articles, or plain text — into an interactive learning system powered by AI and spaced repetition. Upload once, and instantly get AI-generated summaries, flashcards, and quizzes tailored to your content.

Built for students who want to study smarter, not longer.

---

## Key Features

- **AI Study Generation** — Upload a PDF, paste text, or submit a URL. Gemini extracts key concepts, generates smart summaries, creates flashcards, and builds custom quizzes.
- **3D Flashcards with Spaced Repetition** — Interactive card flip with KaTeX math rendering. Built-in SM-2 algorithm schedules reviews at optimal intervals for long-term retention.
- **Boss Mode** — High-intensity review session targeting weak cards with a 3-second timer and auto-flip mechanics.
- **Interactive Quizzes** — Timed, AI-generated quizzes with instant feedback, color-coded results, and detailed explanations.
- **Progress Dashboard** — Track memory health, weekly activity charts, study streaks, and quiz scores.
- **Offline-First PWA** — Fully installable on iOS, Android, and Desktop. All data stored locally in IndexedDB. No account required.
- **Dark & Light Themes** — Beautifully crafted emerald-green design system with smooth animations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **State & Storage** | IndexedDB (`idb`), localStorage |
| **PWA** | `vite-plugin-pwa`, Service Worker, Workbox |
| **Math Rendering** | KaTeX |
| **Backend** | FastAPI (Python 3.13) |
| **AI** | Google Gemini API |
| **Document Parsing** | PyMuPDF, python-docx, BeautifulSoup4 |

---

## Getting Started LOCALLY

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.12
- Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### 1. Clone & Install Frontend

```bash
cd frontend
npm install
```

### 2. Set Up Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_key_here
```

### 4. Run

**Terminal 1 — Backend:**

```bash
cd backend
venv\Scripts\activate     # or source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser. The app works as a PWA — install it to your home screen for the native experience.

### Production Build

```bash
cd frontend
npm run build
npm run preview
```

---

## Project Structure

```
├── frontend/              # React + Vite PWA client
│   ├── src/
│   │   ├── components/    # UI components and feature views
│   │   ├── context/       # App state management
│   │   ├── db/            # IndexedDB operations
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets and PWA icons
│
├── backend/               # FastAPI server
│   ├── app/
│   │   ├── main.py         # API routes
│   │   ├── config.py       # Environment config
│   │   └── services/       # Gemini, parser, scraper
│   ├── requirements.txt
│   └── .env.example
```

---

Built with ❤️ for the hackathon.
