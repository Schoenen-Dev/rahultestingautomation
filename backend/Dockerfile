# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-slim AS base

# Install Google Chrome + Xvfb (virtual display for Selenium)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg ca-certificates \
    xvfb \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
  && wget -q -O /tmp/chrome.deb \
     "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" \
  && apt-get install -y /tmp/chrome.deb \
  && rm /tmp/chrome.deb \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# ── App ───────────────────────────────────────────────────────────────────────
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Expose Railway's dynamic port (Railway sets $PORT)
EXPOSE 5000

# Start Xvfb on :99, then launch the server
CMD Xvfb :99 -screen 0 1280x1024x24 -ac +extension GLX +render -noreset & \
    sleep 2 && \
    DISPLAY=:99 node server.js
