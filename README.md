# NeuroNote - Cyberpunk Digital Notebook with Cross-Device Sync

NeuroNote is a premium, futuristic, cyberpunk-themed digital notebook application featuring rich text writing pages, dynamic drawing canvases, note-contextual AI assistance, and automatic cross-device cloud synchronization.

---

## Architecture Overview
*   **Frontend**: Built with clean, glassmorphic HTML/JS/CSS. Direct integration with Google Identity Services (GSI) for Google Account Login and FileSaver for local `.nn` backups.
*   **Backend (Python)**: A lightweight FastAPI server that runs asynchronously. It handles token verification, SQLite database operations, and proxies requests securely to Gemini AI.
*   **Database (SQLite)**: Serverless SQLite database (`neuronote.db`) that stores encrypted credentials and book contents, making the application run smoothly even on lower-end hardware.

---

## Features
1.  **Cloud Synchronization**: Real-time background sync to save your notes on any device.
2.  **Custom `.nn` Backup**: Export/Import individual books as `.nn` (JSON structured backups).
3.  **Google Account Sync**: Login securely using your Google credentials.
4.  **Developer Sandbox Mode**: Instant offline/testing bypass. Log in with any username (no setup required) to test cloud sync.
5.  **Secure Context-Aware AI**: The backend proxies the Gemini API securely. When you chat with Neuro AI, it reads the context of your active note to provide custom assistance.

---

## Getting Started

### 1. Configure the Backend Environment
Go into the `backend/` directory, copy the template `.env.template` to a new `.env` file, and fill in the values:
```bash
cd backend
cp .env.template .env
```
Inside your `.env` file:
*   `GOOGLE_CLIENT_ID`: (Optional) Your OAuth Client ID from Google Cloud Console. Leave empty to use Sandbox Mode.
*   `GEMINI_API_KEY`: (Recommended) Your API Key from Google AI Studio. Enables note-aware assistant features.
*   `JWT_SECRET`: A custom string for generating login tokens.

### 2. Set Up and Run the Python Backend
Create a virtual environment, install dependencies, and run the server:

**On Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**On macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The server will be running at `http://127.0.0.1:8000`. You can inspect the interactive documentation at `http://127.0.0.1:8000/docs`.

### 3. Open the Frontend
Since the frontend is a pure browser application, you can run it by simply double-clicking `index.html` or running a lightweight local HTTP server (like VS Code's Live Server or Python's `http.server`).

To run with Python:
```bash
# In the root Neuro-Note directory:
python -m http.server 3000
```
Open your browser and navigate to `http://localhost:3000`.

---

## Developer Sandbox Mode (Quick Testing)
If you do not have a Google Client ID configured:
1. Click **Sign In** in the top bar.
2. Under **Developer Sandbox Account**, enter any username (e.g. `alex`).
3. Click **Log In**.
4. The system will create a sandbox profile and automatically sync your notes. Open another browser tab or private window, sign in with the same username, and watch your notes load instantly!

---

## Uploading to GitHub
A `.gitignore` file is included in this repository to prevent uploading sensitive virtual environments (`venv/`), secrets (`.env`), or local database copies (`neuronote.db`).

To upload this repository to your GitHub account:
1. Initialize git locally:
   ```bash
   git init
   ```
2. Add your files:
   ```bash
   git add .
   ```
3. Create your first commit:
   ```bash
   git commit -m "Initial commit: NeuroNote with Google OAuth sync & Python FastAPI backend"
   ```
4. Create a new repository on [GitHub](https://github.com/new).
5. Link your local repository to GitHub and push (replace URL with your repository):
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
