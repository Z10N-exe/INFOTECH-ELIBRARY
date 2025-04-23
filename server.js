// server.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Firebase Admin SDK initialization
const serviceAccount = require('./serviceAccountKey.json'); // 🔐 Downloaded from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "informationtechelibrary.appspot.com" // ✅ Your corrected bucket
});

const bucket = admin.storage().bucket();

// Store uploaded file metadata in memory (for demo purposes)
let uploadedFiles = [];

// Upload route
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const destination = `documents/${req.file.originalname}`;

    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        contentType: req.file.mimetype
      }
    });

    // Create signed URL for download
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2030'
    });

    uploadedFiles.push({
      name: req.file.originalname,
      url
    });

    fs.unlinkSync(filePath); // remove temp file

    res.status(200).json({
      message: 'File uploaded!',
      name: req.file.originalname,
      url
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List uploaded files
app.get('/files', (req, res) => {
  res.json(uploadedFiles);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
