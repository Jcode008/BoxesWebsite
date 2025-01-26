require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { OpenAI } = require('openai');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const fileUploadRoutes = require('./routes/fileUpload'); // Ensure this import

const app = express();

// Middleware
app.use(cors({
    origin: ['https://boxes-vxnc.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// OpenAI setup with error handling
let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI initialized successfully');
} catch (error) {
    console.error('OpenAI initialization error:', error);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', fileUploadRoutes); // Ensure this route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;