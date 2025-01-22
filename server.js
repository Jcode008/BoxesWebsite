require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { OpenAI } = require('openai');  // Fix import
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

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
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;