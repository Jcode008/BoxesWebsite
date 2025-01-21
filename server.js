require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OpenAI } = require('openai');  // Fix import
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Verify environment variables
console.log('Checking environment:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasMongoURI: !!process.env.MONGODB_URI,
    environment: process.env.NODE_ENV
});

// Middleware
app.use(cors({
    origin: ['https://boxes-vxnc.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Atlas connection
const connectDB = async () => {
    try {
        const mongoUri = 'mongodb+srv://jodeety:qhU9P8gH50cgvSFd@cluster0.e4d0kjv.mongodb.net/boxesdb';

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority',
            ssl: true,
            directConnection: false
        });
        console.log('MongoDB Atlas Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        // Add retry logic
        setTimeout(() => {
            console.log('Retrying connection...');
            connectDB();
        }, 5000);
    }
};

// Retry connection
connectDB().catch(console.error);

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;