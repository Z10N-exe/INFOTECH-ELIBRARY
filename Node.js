const express = require('express');
const multer = require('multer');
const { expressjwt: jwt } = require('express-jwt'); // Corrected import
const jwks = require('jwks-rsa');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Set up file storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        // Generate a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// Set up Auth0 authentication (replace with your actual Auth0 details)
const authConfig = {
    domain: 'YOUR_AUTH0_DOMAIN', // e.g., "your-domain.us.auth0.com"
    audience: 'YOUR_AUTH0_AUDIENCE', // e.g., "http://localhost:3000" or your API identifier
};

// Middleware to check for rt.edu.ng email
const checkUniportEmail = (req, res, next) => {
  if (req.auth && req.auth.email && req.auth.email.endsWith('rt.edu.ng')) {
    next(); // User has a valid email, proceed
  } else {
    res.status(403).json({ message: 'Access denied. You must use a rt.edu.ng email address.' });
  }
};

// Authentication middleware using express-jwt
const checkJwt = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
    }),
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithms: ['RS256'],
    credentialsRequired: true, // Ensure user is authenticated
    customUserKey: 'auth' // Store user info in req.auth
});

// API endpoint for file upload (protected with authentication and email check)
app.post('/upload', checkJwt, checkUniportEmail, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Construct the file URL.  Important:  Use req.protocol and req.get('host')
    // to dynamically determine the server's address.  This makes your code
    // work correctly in different environments (development, production).
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;

    //  Include user email in the response
    res.status(200).json({
        message: 'File uploaded successfully.',
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        userEmail: req.auth.email, // Access user email from req.auth
    });
});

// API endpoint for file download (protected with authentication and email check)
app.get('/download/:filename', checkJwt, checkUniportEmail, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename); // Corrected path

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ message: 'Error downloading file.' });
            }
        });
    } else {
        res.status(404).json({ message: 'File not found.' });
    }
});

// Serve static files from the 'uploads' directory (for accessing uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware for JWT authentication errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Invalid token.  Authentication required.' });
    } else {
        next(err); // Pass other errors to the next middleware
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Add this to the top of the file:
const fs = require('fs');
