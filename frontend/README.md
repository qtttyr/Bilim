# <img src="public/app-icon.png" width="48" height="48" style="vertical-align: middle; border-radius: 12px; margin-right: 10px;" /> Bilim — Frontend (PWA Study Client)

This folder contains the frontend source code for **Bilim** — an AI-powered smart study tool using spaced repetition and active recall.

<p align="center">
  <img src="public/app-icon.png" width="128" height="128" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

## ✨ Key Features (Frontend)
- **Local Spaced Repetition (SM-2)**: Operates fully offline using `IndexedDB` to store cards, quizzes, history, and streaks.
- **3D Flashcards**: Beautiful interactive CSS cards with math rendering support (via KaTeX).
- **Boss Mode**: High-intensity review session with a 3-second timer and auto-flip mechanics for weak concepts.
- **Progress Dashboard**: Custom SVG/CSS charts displaying weekly reviews and dynamic memory health metrics.
- **Progressive Web App (PWA)**: Installable on iOS, Android, and Desktop, featuring offline support and assets caching via Service Worker.
- **Double Themes**: Beautifully crafted Light and Dark modes.

## 🛠 Tech Stack
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Icons**: Custom Lucide-based Icon Set
- **Database**: IndexedDB (`idb` wrapper)
- **Mathematical Layout**: KaTeX
- **PWA Tooling**: `vite-plugin-pwa`

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build the production app (incorporating PWA service worker):
   ```bash
   npm run build
   ```

For backend setup and core app architecture details, please refer to the [Root README.md](../README.md).
