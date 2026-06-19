# IELTS Buddy AI - IELTS Preparation Platform

IELTS Buddy AI is an intelligent cross-platform preparation hub combining full exam simulation (Placement Diagnostic, Speaking Practice, Writing Practice, Reading, Listening, and Mock Exams) with a personal AI tutor (Buddy) available 24/7.

## Key Features
1. **Interactive Placement Diagnostic:** Quick 5-minute placement test for Reading and Writing, evaluated instantly by Gemini AI.
2. **Speaking Practice Module:** Sequential 3-question verbal assessment powered by the browser's native Web Speech API (`SpeechRecognition`) and scored by Gemini AI.
3. **Writing Practice Module:** Full grading on Task 1 and Task 2 descriptors (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range) with recommendations for improvement.
4. **Learn Section:** Level-appropriate media recommendations (TV shows, movies, books, podcasts) with direct links and tasks.
5. **Interactive AI Tutor (Buddy):** Conversational chatbot using Gemini API, pre-loaded with the student's profile, diagnostic, and essay context.
6. **Profile Customization:** Support for pre-set avatars and custom image uploads, bio editing, and historical logs.

---

## Setup & Local Development

### 1. Prerequisites
- **Node.js:** Ensure you have Node.js version 20.19.0 or higher.
- **npm:** Typically installed automatically with Node.js.

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Variables Config
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Open `.env` and fill in your Gemini API key:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If no API key is specified, the application will transparently fall back to pre-configured local mock feedback generators to allow offline testing and development.*

### 4. Running the Dev Server
To start the Expo development server:
```bash
npm run web
```
The server will boot on `http://localhost:8081`. You can open this link in any modern browser (Chrome is highly recommended for Microphone support).

---

## Verification & Testing

### 1. TypeScript Validation
Verify that code types check clean:
```bash
npm run typecheck
```

### 2. E2E Verification
To execute the automated Playwright E2E test suite locally:
1. Ensure the dev server is running on `http://localhost:8081`.
2. Execute the verification script:
   ```bash
   npm run verify:web
   ```

---

## Production Build & Deployment

### 1. Build Production Export
To generate the optimized static export bundle in the `/dist` directory:
```bash
npm run export:web
```

### 2. Deploy via Vercel
Deploy to production using Vercel CLI:
```bash
vercel --prod
```
