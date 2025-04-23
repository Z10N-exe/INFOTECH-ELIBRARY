require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs').promises;

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Cloudinary configuration (replace with your actual credentials or env vars)
cloudinary.config({
    cloud_name: 'dsjgsdgox',
    api_key: '876358767613788',
    api_secret: 'ESRgHQWFvq5WMdP_aH97pYEByY4'
});

// Multer setup (as before)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'e-library-documents',
        resource_type: 'auto',
        format: async (req, file) => 'pdf',
        public_id: (req, file) => file.originalname.split('.')[0]
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only document files (PDF, DOC, DOCX) are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload route (as before)
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

// Library route (as before)
app.get('/library', async (req, res) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'e-library-documents/'
        });
        const fileNames = result.resources.map(resource => resource.public_id + '.' + resource.format);
        let libraryHTML = await fs.readFile('library.html', 'utf8');
        const insertionPoint = ''; // Make sure this placeholder exists in your library.html
        let fileListHTML = '<ul>';
        fileNames.forEach(fileName => {
            fileListHTML += `<li>${fileName}</li>`;
        });
        fileListHTML += '</ul>';
        const updatedHTML = libraryHTML.replace(insertionPoint, fileListHTML);
        res.setHeader('Content-Type', 'text/html');
        res.send(updatedHTML);
    } catch (error) {
        console.error('Error fetching files or reading HTML:', error);
        res.status(500).send('Failed to retrieve file list or load library page.');
    }
});

// Root route handler
app.get('/', (req, res) => {
    res.send('Welcome to the E-Library server!');
});

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});