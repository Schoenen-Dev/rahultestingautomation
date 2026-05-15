# Bot Control Panel — Railway Deploy Guide

## What changed

| Before | After |
|--------|-------|
| `stdio: "inherit"` — logs went nowhere | Per-bot log capture, viewable in UI |
| `localhost:5000` hardcoded in frontend | Relative URLs — works on any domain |
| No status endpoint | `/status` polls bot state every 3 s |
| Plain `.bat` runner | Dockerfile with Chrome + Xvfb for headless Selenium |
| Frontend separate file | Served as static from same Express app |

---

## Project structure

```
backend/
  server.js        ← Express API + static file server
  package.json
  Dockerfile       ← Chrome + Xvfb for Railway
  railway.json
  public/
    index.html     ← Full UI (bot grid + live log panel)
  ani.js           ← your bot scripts (copy from original)
  george.js
  jessica.js
  ... (all other .js bot files)
```

---

## Step 1 — Copy your bot scripts

Copy every `*.js` bot file from the original `backend/` folder into this `backend/` folder:

```
ani.js  george.js  jessica.js  kevin.js  mansion.js
rigan.js  sam.js  susan.js  mathews.js
rodney1.js  rodney2.js  rodney3.js  Sergio.js
```

> You do NOT need the `node_modules/`, `.bat`, `.png`, `.txt` files.

---

## Step 2 — Make bots run headless

In each bot's `chrome.Options()` setup, ensure headless mode:

```js
const options = new chrome.Options();
options.addArguments("--headless=new");
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-gpu");
options.addArguments("--window-size=1280,900");
```

Or read the `HEADLESS` env var the server already sets:

```js
if (process.env.HEADLESS === "1") {
  options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu");
}
```

---

## Step 3 — Deploy to Railway

1. Push this `backend/` folder (with your bot `.js` files) to a GitHub repo.
2. In Railway → **New Project** → **Deploy from GitHub repo**.
3. Railway auto-detects `Dockerfile` — no extra config needed.
4. After deploy, open the Railway-provided URL — the control panel loads instantly.

### Environment variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `5000`  | Auto-set by Railway |
| `HEADLESS` | `1`  | Set to `0` to disable headless (not useful on Railway) |

---

## Vercel (frontend-only, optional)

If you also want the UI on Vercel:

1. Copy `public/index.html` to a separate Vercel project.
2. In `index.html`, change `const BASE = "";` to:
   ```js
   const BASE = "https://your-railway-app.up.railway.app";
   ```
3. Add CORS origin in `server.js` if needed.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/start/:name` | Start one bot |
| `POST` | `/stop/:name`  | Stop one bot  |
| `POST` | `/start-all`   | Start all bots (staggered 2 s) |
| `POST` | `/stop-all`    | Stop all bots |
| `GET`  | `/status`      | `{ name: "running"\|"stopped"\|"error" }` |
| `GET`  | `/logs/:name?since=N` | Lines after index N |
| `DELETE` | `/logs/:name` | Clear log buffer |
| `GET`  | `/health`      | Health check |
