const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '495078pztmrjyz299bmkd6';

app.use(cors());

// Convert seconds to minutes and seconds format
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Fetch videos from Doodstream with pagination
app.get('/api/videos', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;

    try {
        const response = await axios.get(`https://doodapi.com/api/file/list?key=${API_KEY}&page=${page}&per_page=${perPage}`);
        const videos = response.data.result.files.map(video => ({
            ...video,
            formatted_length: formatDuration(video.length)
        }));
        res.json({ ...response.data, result: { ...response.data.result, files: videos } });
    } catch (error) {
        console.error('Error fetching videos:', error.message);
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            res.status(500).json({ error: 'No response from Doodstream' });
        } else {
            res.status(500).json({ error: 'Failed to fetch videos' });
        }
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
