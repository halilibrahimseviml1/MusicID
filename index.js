const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Geçici Bellek (Eğer MongoDB kullanmıyorsan veriler burada saklanır)
let songs = [];

// Tüm şarkıları listele
app.get('/songs', (req, res) => {
    res.json(songs);
});

// Şarkı ekle (Aynı ID veya aynı isim varsa engeller)
app.post('/songs', (req, res) => {
    const { name, id, addedBy, userId } = req.body;
    
    if (!name || !id) {
        return res.status(400).json({ error: "Name and ID are required" });
    }

    // Aynı ID veya İsim var mı kontrol et
    const exists = songs.some(song => song.id === id || song.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).json({ error: "Song already exists" });
    }

    const newSong = {
        _id: Date.now().toString(), // Benzersiz veritabanı anahtarı
        id: id,
        name: name,
        addedBy: addedBy || "Unknown",
        userId: userId || "1"
    };

    songs.push(newSong);
    res.status(201).json(newSong);
});

// Şarkı sil (ID'ye göre)
app.delete('/songs/:id', (req, res) => {
    const songId = req.params.id;
    const initialLength = songs.length;
    
    songs = songs.filter(song => song._id !== songId && song.id !== songId);

    if (songs.length < initialLength) {
        res.json({ success: true, message: "Song deleted" });
    } else {
        res.status(404).json({ error: "Song not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
