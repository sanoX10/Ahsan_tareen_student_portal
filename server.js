// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON requests
app.use(cors()); // Enable CORS for all origins (for development)

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management_system';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Debug: Log registered route paths (optional, but helpful for debugging)
function logRoutes(prefix, router) {
    if (!router.stack) return;
    console.log(`\n📌 Mounted routes under '${prefix}':`);
    router.stack.forEach(layer => {
        if (layer.route) {
            const method = Object.keys(layer.route.methods)[0].toUpperCase();
            console.log(`   [${method}] ${prefix}${layer.route.path}`);
        }
    });
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
logRoutes('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);
logRoutes('/api/admin', adminRoutes);

app.use('/api/student', studentRoutes);
logRoutes('/api/student', studentRoutes);


// --- Frontend Serving ---

// 1. Explicitly serve home.html for the root URL
// This ensures that when you go to http://localhost:PORT/, it serves home.html.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // <--- CHANGED HERE
});

// 2. Serve other static files (CSS, JS, images, other HTML files like index.html)
// This must come AFTER the specific '/' route, but BEFORE the catch-all.
app.use(express.static(path.join(__dirname, 'public')));

// 3. Fallback for SPA behavior (any other unhandled GET requests go to home.html)
// This is important if your home.html also contains client-side routing,
// or if you want any invalid path to redirect to your home page.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // <--- CHANGED HERE
});


// Error handler (for unhandled errors in middleware/routes)
app.use((err, req, res, next) => {
    console.error('🔥 Global Error Handler:', err.stack);
    // Send a generic error response, ensure it's JSON for API calls
    if (req.accepts('json')) {
        res.status(500).json({ msg: 'Server Error: Something went wrong!' });
    } else {
        res.status(500).send('Something broke!');
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
});