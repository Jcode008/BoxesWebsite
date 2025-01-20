const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        // Add chat logic here
        res.json({ content: 'Response message' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;