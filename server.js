const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let songs = [
    {name: "Billie jean", id: "116197983114890"},
    {name: "Rat dance phonk", id: "119598380829349"},
    {name: "Çakal gözler", id: "8080832471"},
    {name: "Tv girl phonk", id: "97114986523444"},
    {name: "Wish her well", id: "140084123949683"},
    {name: "Goosebumps", id: "134302801244622"},
    {name: "That girl a stalker", id: "133204828537200"},
    {name: "Turkish march[🇹🇷👑]", id: "1842150151"}
];

app.get('/songs', (req, res) => {
    res.json(songs);
});

app.post('/songs', (req, res) => {
    const { name, id } = req.body;
    if (name && id) {
        songs.push({ name, id });
        res.status(201).json({ success: true });
    } else {
        res.status(400).json({ error: 'Eksik bilgi' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server aktif: ${PORT}`));
