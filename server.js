const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON
app.use(cors());
app.use(express.json());

// Multer setup for file uploads (no need to store locally anymore)
const upload = multer({ dest: 'uploads/' }); // Store in memory

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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const destination = `documents/${originalName}`;
    const contentType = req.file.mimetype;

    const file = bucket.file(destination);
    await file.save(fileBuffer, {
      metadata: {
        contentType: contentType
      }
    });

    // Create signed URL for download
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2030'
    });

    uploadedFiles.push({
      name: originalName,
      url
    });

    res.status(200).json({
      message: 'File uploaded to Firebase Storage!',
      name: originalName,
      url
    });
  } catch (err) {
    console.error('Firebase Storage upload error:', err);
    res.status(500).json({ error: 'Failed to upload file to Firebase Storage' });
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