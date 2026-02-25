import express from 'express';
import cors from 'cors';
import { getRecommendations } from './rag.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/movie', async (req, res) => {
    try {
        const { movie, reason } = req.body;

        if (!movie || !reason) {
            return res.status(400).json({ error: "movie and reason are required" });
        }

        // Support both array and comma-separated string
        const movies = Array.isArray(movie)
            ? movie.map(m => m.trim()).filter(Boolean)
            : movie.split(',').map(m => m.trim()).filter(Boolean);

        if (!movies.length) {
            return res.status(400).json({ error: "No valid movie titles provided" });
        }

        const likedMoviesWithReasons = movies.map(title => ({ title, reason }));

        const recommendations = await getRecommendations(likedMoviesWithReasons);
        return res.status(200).json({ recommendations });

    } catch (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));