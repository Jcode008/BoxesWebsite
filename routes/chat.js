const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Verify API key exists
if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OpenAI API key');
    throw new Error('OpenAI API key is required');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000
});

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Sending message to OpenAI:', message);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ 
                role: "user", 
                content: message 
            }],
            max_tokens: 500,
            temperature: 0.7
        });

        console.log('Received response from OpenAI');
        const responseMessage = completion.choices[0].message.content;
        res.json({ content: responseMessage });
    } catch (error) {
        console.error('OpenAI error:', error.message);
        res.status(500).json({ 
            error: 'Failed to get chat response',
            details: error.message 
        });
    }
});

module.exports = router;