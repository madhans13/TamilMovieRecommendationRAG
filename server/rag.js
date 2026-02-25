import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function vectorize(text) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: [text],
        config: { outputDimensionality: 1536 }
    });
    return response.embeddings[0].values;
}

function parseEmbedding(embedding) {
    if (typeof embedding === "string") {
        return embedding.replace(/[\[\]]/g, "").split(",").map(Number);
    }
    return embedding;
}

function blendVectors(vecA, vecB, weightA, weightB) {
    return vecA.map((val, i) => val * weightA + vecB[i] * weightB);
}

function averageAndNormalize(vectors) {
    const length = vectors[0].length;
    const avg = new Array(length).fill(0);
    for (const vec of vectors) {
        for (let i = 0; i < length; i++) avg[i] += vec[i];
    }
    const magnitude = Math.sqrt(avg.reduce((sum, val) => sum + val * val, 0));
    return avg.map(v => v / magnitude);
}

function normalizeTitle(title) {
    return title.trim().toLowerCase();
}

function buildEnrichedContext(movie, reason) {
    return `Title: ${movie.title}
Director: ${movie.director}
Cast: ${movie.cast?.join(", ") || ""}
Genre: ${movie.genre?.join(", ") || ""}
Mood: ${movie.mood || ""}
Themes: ${movie.themes || ""}
Summary: ${movie.summary || ""}
Why I liked it: ${reason}`;
}

function buildFallbackContext(title, reason) {
    return `Title: ${title}
Why I liked it: ${reason}`;
}

async function seedData() {
    const data = fs.readFileSync("../movies.json", "utf-8");
    const movies = JSON.parse(data);

    for (const movie of movies) {
        const text = `Title: ${movie.title}
Director: ${movie.director}
Cast: ${movie.cast.join(", ")}
Genre: ${movie.genre.join(", ")}
Mood: ${movie.mood}
Themes: ${movie.themes}
Summary: ${movie.summary}`;

        const vector = await vectorize(text);

        const { error } = await supabase.from("movies").insert({
            title: movie.title,
            year: movie.year,
            director: movie.director,
            rating: movie.rating,
            cast_members: movie.cast,
            genre: movie.genre,
            mood: movie.mood,
            themes: movie.themes,
            summary: movie.summary,
            embedding: vector
        });

        if (error) console.error(`Failed ${movie.title}:`, error.message);
        else console.log(`✓ Inserted ${movie.title}`);
    }
}
// seedData();

// ─── NEW: LLM Reasoning Step ────────────────────────────────────────────────
// Takes the retrieved recommendations + user's liked movies with reasons,
// calls Gemini to generate a personalized "why" explanation for each movie,
// then merges the explanations back into the recommendations array by title.

async function generateWhyRecommended(likedMoviesWithReasons, recommendations) {
    const prompt = `You are a movie expert and recommendation engine.

A user liked these movies:
${likedMoviesWithReasons.map(m => `- "${m.title}" because: "${m.reason}"`).join("\n")}

Based on their taste, these movies were retrieved as recommendations:
${recommendations.map(r => `- "${r.title}" (${r.year}) | Genre: ${Array.isArray(r.genre) ? r.genre.join(", ") : r.genre} | Summary: ${r.summary}`).join("\n")}

For each recommended movie, write exactly 1-2 sentences explaining WHY it specifically matches this user's taste.
Be specific — directly reference the themes, mood, or reasons the user mentioned.
Do NOT write generic descriptions. Connect each movie to what the user actually said they loved.

Return ONLY a valid JSON array with no markdown, no code fences, no extra text.
Each object must have exactly these two fields: "title" and "why_recommended".

Example format:
[
  {"title": "Movie Name", "why_recommended": "Because you loved X in Y, this film delivers Z..."},
  ...
]`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: prompt }]
    });

    // Extract raw text from Gemini response
    const rawText = response.candidates[0].content.parts[0].text;

    // Strip any accidental markdown code fences
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // Parse the JSON array
    const explanations = JSON.parse(cleaned);

    // Build a lookup map: lowercase title → why_recommended
    const explanationMap = new Map(
        explanations.map(e => [e.title.toLowerCase(), e.why_recommended])
    );

    // Merge why_recommended into each recommendation object by matching title
    return recommendations.map(movie => ({
        ...movie,
        why_recommended: explanationMap.get(movie.title.toLowerCase()) || ""
    }));
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function getRecommendations(likedMoviesWithReasons) {
    const normalizedInputs = likedMoviesWithReasons.map(m => ({
        ...m,
        normalizedTitle: normalizeTitle(m.title)
    }));

    // Case-insensitive match against all liked movie titles
    const { data: likedMovies, error } = await supabase
        .from("movies")
        .select("title, embedding, director, cast_members, genre, mood, themes, summary")
        .or(
            normalizedInputs
                .map(m => `title.ilike.${m.normalizedTitle}`)
                .join(",")
        );

    if (error) throw new Error(`Supabase error: ${error.message}`);

    const foundMap = new Map(
        (likedMovies || []).map(m => [m.title.toLowerCase(), m])
    );

    const notFoundTitles = normalizedInputs
        .filter(m => !foundMap.has(m.normalizedTitle))
        .map(m => m.title);

    if (notFoundTitles.length > 0) {
        console.warn(`Movies not found in DB (using reason-only fallback): ${notFoundTitles.join(", ")}`);
    }

    if (foundMap.size === 0 && normalizedInputs.every(m => !m.reason)) {
        throw new Error("No movies found and no reasons provided to generate recommendations.");
    }

    // Build blended taste vectors
    const blendedVectors = await Promise.all(
        normalizedInputs.map(async ({ normalizedTitle, title, reason }) => {
            const dbMovie = foundMap.get(normalizedTitle);

            if (dbMovie) {
                const parsed = { ...dbMovie, embedding: parseEmbedding(dbMovie.embedding) };
                const enrichedText = buildEnrichedContext(parsed, reason || "");
                const enrichedVector = await vectorize(enrichedText);
                return blendVectors(parsed.embedding, enrichedVector, 0.3, 0.7);
            } else {
                const fallbackText = buildFallbackContext(title, reason || "");
                return vectorize(fallbackText);
            }
        })
    );

    const tasteVector = averageAndNormalize(blendedVectors);
    const excludeTitles = [...foundMap.values()].map(m => m.title);

    // Step 1: Retrieve semantically similar movies from Supabase
    const { data: recommendations, error: rpcError } = await supabase.rpc("match_movies", {
        query_embedding: tasteVector,
        match_count: 8,
        exclude_titles: excludeTitles
    });

    if (rpcError) throw new Error(rpcError.message);

    // Step 2: Generate LLM reasoning — this is the RAG "generation" step
    // Each movie gets a personalized "why_recommended" explanation from Gemini
    const enrichedRecommendations = await generateWhyRecommended(
        likedMoviesWithReasons,
        recommendations
    );

    return enrichedRecommendations;
}