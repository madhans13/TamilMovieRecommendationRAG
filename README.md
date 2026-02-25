# 🎬 CineMatch

> AI-powered movie recommendation engine — tell us what you loved, we'll find what you'll love next.

![RAG](https://img.shields.io/badge/RAG-Pipeline-E50914?style=flat-square)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=flat-square&logo=google)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=flat-square&logo=supabase)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react)

---

## How It Works

CineMatch implements a full **RAG (Retrieval-Augmented Generation)** pipeline:

1. **Embed** — User's liked movies + reasons are vectorized via `gemini-embedding-001` (1536 dims)
2. **Blend** — Stored movie embedding (30%) is merged with a reason-enriched embedding (70%) for nuanced taste modeling
3. **Retrieve** — Blended taste vector is queried against Supabase's pgvector store via `match_movies` RPC
4. **Generate** — Gemini Flash reads the retrieved movies + user preferences and writes a personalized *"Why it's for you"* for each result

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Embeddings | Gemini Embedding 001 |
| LLM Reasoning | Gemini Flash |
| Vector DB | Supabase + pgvector |
| Posters | OMDB API |

---

## Getting Started

**Prerequisites:** Node.js v18+, Supabase project, Gemini API key, OMDB API key

```bash
git clone https://github.com/yourusername/cinematch.git
cd cinematch
npm install
```

Create a `.env` file in the server directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the app:

```bash
# Backend
cd server && node index.js

# Frontend (new terminal)
cd client && npm run dev
```

---

## Project Structure

```
cinematch/
├── client/         # React swipe UI
├── server/
│   ├── index.js    # Express API
│   ├── rag.js      # RAG pipeline
│   └── .env
└── movies.json     # Seed data
```

---

## API

**POST** `/movie`

```json
// Request
{ "movie": "Vikram, Kaithi", "reason": "Dark thriller vibe, complex characters" }

// Response
{ "recommendations": [{ "title": "...", "score": 0.92, "why_recommended": "..." }] }
```

---

*Built with Google Gemini · Supabase · React*
