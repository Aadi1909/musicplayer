const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const multer = require('multer');
const AWS = require('aws-sdk');

dotenv.config();

const app = express();
const PORT = 3000;

const musicDir = path.join(__dirname, 'public/Music');
app.use(cors());
app.use('/Music', cors(), express.static(musicDir));
app.use(express.static('public'));

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/api/songs', async (req, res) => {
  try {
    const data = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    const files = data.Contents.map(file => ({
      name: file.Key,
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}` 
    }));
    res.json(files);
  } catch (err) {
    console.error('List Error', err);
    res.status(500).json({ error: 'Failed to list songs' });
  }
});

app.post('/api/upload', upload.single('audio'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const params = {
    Bucket: BUCKET,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({ success: true, url: data.Location });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
