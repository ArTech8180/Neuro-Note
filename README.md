# 🧠 NeuroNote — Setup Guide

## Quick Start (No Backend Needed)

1. Open `index.html` in a browser — **done!**  
   All features work offline via `localStorage`.

## Enabling AI (Gemini)

Open `script.js` and set **one** of:

```js
// Option A — Direct Gemini (client-side, easiest)
const GEMINI_API_KEY_DIRECT = "YOUR_GEMINI_KEY";

// Option B — Your backend proxy
const BACKEND_URL = "https://your-backend.com";
```

Get a free Gemini key at: https://aistudio.google.com/app/apikey

## Enabling Cloud Sync (Firebase)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Firestore** and **Google Auth**
3. Paste your config into `firebase.js`:

```js
const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "...",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
```

4. Deploy or serve with any static host (Netlify, Vercel, GitHub Pages, Firebase Hosting)

> **Important:** Firebase SDK imports use `type="module"` — you need to serve from a local server (not `file://`).  
> Use: `npx serve .` or `python -m http.server 8080`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main app shell + all UI |
| `style.css` | All 4 themes + full layout (1800+ lines) |
| `script.js` | All app logic: books, canvas, AI, export |
| `firebase.js` | Firebase init + exports |
| `firebase-auth.js` | Auth state + cloud sync |
| `icon.png` | App icon (replace with your own) |

## Themes

Switch via ⚙ Settings → Themes dropdown:
- **Dark** — cyberpunk deep blue (default)
- **Light** — clean white
- **Red** — dark crimson
- **Cyber** — neon purple

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Manual save |
| `Ctrl+K` | Command palette |
| `/` | Slash command menu |

## Features

- 📚 Books → Chapters → Pages hierarchy
- ✍️ Rich text editor (bold, italic, headings, lists, colors, highlights)
- 🎨 Full painting page (brush, marker, eraser, shapes, bucket fill, pan, zoom)
- 🖼️ Inline draw blocks in writing pages
- 📊 Table creator
- 🤖 Gemini AI sidebar
- 📤 Export to PDF, `.nn` (NeuroNote backup)
- 📥 Import `.nn` and PDF files
- 🔥 Firebase cloud sync
- 🌗 4 themes with instant switching
- 💾 Auto-save (localStorage + cloud)
- ⌨ Command palette (Ctrl+K)
