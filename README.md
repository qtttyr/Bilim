# Bilim — AI-Powered Smart Study Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

**Bilim** (from Kazakh *"knowledge"*) transforms any study material — PDFs, lecture notes, web articles, or plain text — into an interactive learning system powered by AI and spaced repetition. Upload once, and instantly get AI-generated summaries, flashcards, and quizzes tailored to your content.

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

<!-- mk-studio:start -->
<p align="center"><a href="https://www.mk-studio.xyz"><img src="https://img.shields.io/badge/MK_STUDIO-ideas%2C_shipped.-0A0A0C?style=flat-square&labelColor=0A0A0C&color=4CC2E8" alt="Built by MK Studio" height="20" /></a></p>
<!-- mk-studio:end -->
