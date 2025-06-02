const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ✅ Enable CORS globally (for API)
app.use(cors());

// ✅ Serve audio files from /Music with CORS headers
app.use('/Music', cors(), express.static(path.join(__dirname, 'public/Music')));

// Serve other static assets (e.g. index.html, CSS, etc.)
app.use(express.static('public'));

// API endpoint to list MP3 files
app.get('/api/songs', (req, res) => {
  const audioDir = path.join(__dirname, './public/Music');

  fs.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read audio directory' });
    }

    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
    res.json(mp3Files);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
