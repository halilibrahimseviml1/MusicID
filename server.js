const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

const songSchema = new mongoose.Schema({
    id: String,
    name: String,
    addedBy: String,
    userId: String
});

const Song = mongoose.model('Song', songSchema);

app.get('/songs', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const songs = await Song.find({});
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/songs', async (req, res) => {
    const { name, id, addedBy, userId } = req.body;
    
    if (!name || !id) {
        return res.status(400).json({ error: "Name and ID are required" });
    }

    try {
        const exists = await Song.findOne({ 
            $or: [{ id: id }, { name: new RegExp('^' + name + '$', 'i') }] 
        });

        if (exists) {
            return res.status(400).json({ error: "Song already exists" });
        }

        const newSong = new Song({
            id: id,
            name: name,
            addedBy: addedBy || "Unknown",
            userId: userId || "1"
        });

        await newSong.save();
        res.status(201).json(newSong);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete('/songs/:id', async (req, res) => {
    const songId = req.params.id;
    try {
        const deleted = await Song.findOneAndDelete({ 
            $or: [{ _id: songId.match(/^[0-9a-fA-F]{24}$/) ? songId : null }, { id: songId }] 
        });

        if (deleted) {
            res.json({ success: true, message: "Song deleted" });
        } else {
            res.status(404).json({ error: "Song not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
