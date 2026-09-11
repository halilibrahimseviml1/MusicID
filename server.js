const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const filePath = path.join(__dirname, 'songs.json');

function getSongs() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveSongs(songs) {
    fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));
}

app.get('/songs', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(getSongs());
});

app.post('/songs', (req, res) => {
    const { name, id, addedBy, userId } = req.body;
    
    if (!name || !id) {
        return res.status(400).json({ error: "Name and ID are required" });
    }

    let songs = getSongs();

    const exists = songs.some(song => song.id === id || song.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).json({ error: "Song already exists" });
    }

    const newSong = {
        _id: Date.now().toString(),
        id: id,
        name: name,
        addedBy: addedBy || "Unknown",
        userId: userId || "1"
    };

    songs.push(newSong);
    saveSongs(songs);
    res.status(201).json(newSong);
});

app.delete('/songs/:id', (req, res) => {
    const songId = req.params.id;
    let songs = getSongs();
    const initialLength = songs.length;
    
    songs = songs.filter(song => song._id !== songId && song.id !== songId);

    if (songs.length < initialLength) {
        saveSongs(songs);
        res.json({ success: true, message: "Song deleted" });
    } else {
        res.status(404).json({ error: "Song not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
