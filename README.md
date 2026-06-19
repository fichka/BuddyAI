# IELTS Buddy AI — Intelligent IELTS Preparation Platform

IELTS Buddy AI is a cross-platform intelligent IELTS preparation hub that combines a full exam simulation engine with a personal AI tutor (Buddy AI) powered by Google Gemini. It delivers real Speaking, Writing, Reading, and Listening practice with instant band score feedback.

---

## Key Features

| Feature | Description |
|---|---|
| 🎯 **Mini Placement Test** | 5-minute Reading + Writing diagnostic evaluated instantly by Gemini AI |
| 🎤 **AI Speaking Practice** | 3-question verbal assessment via browser's Web Speech API, graded by Gemini |
| ✍️ **AI Writing Grader** | Task 1 & Task 2 feedback against official IELTS band descriptors (TA, CC, LR, GR) |
| 📚 **Learn Section** | Level-appropriate media (TV shows, films, books, podcasts) with direct links |
| 🤖 **Buddy AI Tutor** | Conversational chatbot using Gemini API, preloaded with your full student profile |
| 👤 **Profile & Avatar** | Custom image upload, bio editing, and diagnostic history logs |
| 📈 **Personalized Roadmap** | Auto-generated prep plan targeting your weak spots |
| 🔐 **Telegram OAuth** | Register and sign in with Telegram in one click |

---

## Quick Start

### 1. Prerequisites

- **Node.js** ≥ 20.19.0 — [Download](https://nodejs.org/)
- **npm** (bundled with Node.js)
- *(Optional for Telegram OAuth)* A Telegram account

### 2. Clone & Install

```bash
git clone https://github.com/fichka/BuddyAI.git
cd BuddyAI
npm install
```

### 3. Configure Environment Variables

Copy the example env file and edit it:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# ─────────────────────────────────────────────────────────────────────────────
# 1. GEMINI API KEY (REQUIRED for real AI scoring)
# ─────────────────────────────────────────────────────────────────────────────
# Get a free key at: https://aistudio.google.com/app/apikey
# Without this key the app falls back to offline mock scores automatically.
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# ─────────────────────────────────────────────────────────────────────────────
# 2. TELEGRAM OAUTH (OPTIONAL — enables "Continue with Telegram" button)
# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Create a Telegram OAuth application at https://oauth.telegram.org
# Step 2: Copy the Client ID and Client Secret shown in the dashboard.
# The pre-filled values below are the developer credentials. Replace with
# your own credentials if you deploy your own instance.
EXPO_PUBLIC_TELEGRAM_CLIENT_ID=6529279176
EXPO_PUBLIC_TELEGRAM_CLIENT_SECRET=ND6rMlN6Dly5QkkuR1Nh7xzsgRfRIxM-Q6uXfrRRXSYUMfKQX0Q9Yw
```

> **Note:** If `EXPO_PUBLIC_GEMINI_API_KEY` is empty, the app automatically uses
> pre-configured offline mock feedback so you can test locally without an API key.

### 4. Start the Development Server

```bash
npm run web
```

The server starts at **http://localhost:8081**.

> **Recommendation:** Use **Google Chrome** for the best experience — Chrome has the most complete implementation of the Web Speech API required for Speaking practice.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | ✅ Recommended | Google Gemini API key. Get free at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `EXPO_PUBLIC_TELEGRAM_CLIENT_ID` | ⬜ Optional | Telegram OAuth App Client ID from [oauth.telegram.org](https://oauth.telegram.org) |
| `EXPO_PUBLIC_TELEGRAM_CLIENT_SECRET` | ⬜ Optional | Telegram OAuth App Client Secret |

---

## Telegram OAuth Setup

To enable the **"Continue with Telegram"** button:

1. Open [https://oauth.telegram.org](https://oauth.telegram.org) and log in with your Telegram account.
2. Create a new OAuth application.
3. Set the **Redirect URI** to your deployment URL + `/register/telegram-callback`  
   e.g. `https://your-app.vercel.app/register/telegram-callback`
4. Copy the **Client ID** and **Client Secret** from the dashboard.
5. Paste them into your `.env` file as `EXPO_PUBLIC_TELEGRAM_CLIENT_ID` and `EXPO_PUBLIC_TELEGRAM_CLIENT_SECRET`.

The pre-configured credentials in this repo work on the official demo deployment.  
If you deploy your own instance you **must** register a new OAuth app with your own redirect URI.

---

## Verification & Testing

### TypeScript Check

```bash
npm run typecheck
```

### E2E Verification (Playwright)

1. Make sure the dev server is running:
   ```bash
   npm run web
   ```
2. In a separate terminal, run:
   ```bash
   npm run verify:web
   ```

---

## Production Build & Deployment

### Build Static Export

```bash
npm run export:web
```

This generates the optimized static bundle in the `/dist` directory.

### Deploy to Vercel

```bash
# First-time setup (links project to Vercel)
vercel

# Deploy to production
vercel --prod
```

Or use the Vercel CLI shortcut from `package.json`:

```bash
npm run deploy
```

### Environment Variables on Vercel

In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Your Gemini API key |
| `EXPO_PUBLIC_TELEGRAM_CLIENT_ID` | `6529279176` (or your own) |
| `EXPO_PUBLIC_TELEGRAM_CLIENT_SECRET` | Your Telegram OAuth secret |

---

## Project Structure

```
BuddyAI/
├── app/                        # Expo Router screens
│   ├── index.tsx               # Landing page + Mini diagnostic test
│   ├── dashboard.tsx           # Main student dashboard
│   ├── practice.tsx            # Speaking / Writing / Reading / Listening
│   ├── learn.tsx               # Media recommendations & study tips
│   ├── buddy.tsx               # Buddy AI chatbot interface
│   ├── roadmap.tsx             # Personalized study roadmap
│   ├── profile.tsx             # Profile settings & avatar upload
│   └── register/               # Multi-step onboarding flow
│       ├── name.tsx            # Step 1: Credentials + Full Name + About Me
│       ├── class.tsx           # Step 2: Class level & target band score
│       ├── about.tsx           # Step 3: Final goals confirmation
│       ├── reveal.tsx          # Score reveal after registration
│       ├── telegram-callback.tsx  # Telegram OAuth callback handler
│       └── telegram-profile.tsx   # Telegram OAuth additional info
├── components/
│   └── ui.tsx                  # Design system components (Panel, Pill, etc.)
├── lib/
│   ├── aiClient.ts             # Gemini API integration (Speaking + Writing)
│   ├── telegramOauth.ts        # Telegram OAuth PKCE flow
│   ├── store.ts                # Zustand global state management
│   ├── mockData.ts             # Mock data and prompts
│   └── types.ts                # TypeScript type definitions
├── scripts/
│   ├── export-web.mjs          # Production build script
│   └── verify-web.mjs          # Playwright E2E verification
├── .env.example                # Environment variable template
└── README.md                   # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev) with [Expo Router](https://expo.github.io/router/) |
| **Language** | TypeScript |
| **Styling** | NativeWind (TailwindCSS for React Native) + Vanilla CSS |
| **State** | [Zustand](https://github.com/pmndrs/zustand) |
| **AI** | [Google Gemini API](https://ai.google.dev/) |
| **Auth** | Telegram OAuth 2.0 / OIDC with PKCE |
| **Speech** | Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) |
| **Deployment** | [Vercel](https://vercel.com) (Static Export) |
| **Testing** | [Playwright](https://playwright.dev) |

---

## Live Demo

🔗 **[https://ielts-buddy-ai.vercel.app](https://ielts-buddy-ai.vercel.app)**

---

## License

MIT License — free to use, modify, and distribute.
