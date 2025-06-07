const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = 3000;

app.use(cors());
app.use('/Music', cors(), express.static(path.join(__dirname, 'public/Music')));

app.use(express.static('public'));


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
