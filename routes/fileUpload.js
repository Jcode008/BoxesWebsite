const express = require('express');
const router = express.Router();
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ 
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    })
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file);

        // Read file content
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        
        // Send to OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `Analyze this file content: ${fileContent}`
                }
            ]
        });

        // Clean up file
        fs.unlinkSync(req.file.path);

        res.json({ 
            message: 'File analyzed successfully',
            analysis: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('Upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;