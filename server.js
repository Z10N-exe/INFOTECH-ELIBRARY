// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Configure Cloudinary with .env variables
cloudinary.config({
  cloud_name: process.env.dsjgsdgox,
  api_key: process.env.876358767613788,
  api_secret: process.env.ESRgHQWFvq5WMdP_aH97pYEByY4
});

// Set up Cloudinary Storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-library-documents',
    resource_type: 'auto', // allows all file types
    format: async (req, file) => 'pdf', // allows pdf only format
    public_id: (req, file) => file.originalname.split('.')[0]
  },
});

// Filter to accept only document files (.pdf, .docx, .doc)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only document files (PDF, DOC, DOCX) are allowed!'), false);
  }
  cb(null, true);
};

// Multer configuration with file filter
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

// Upload route
app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or wrong file type.' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    url: req.file.path
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
