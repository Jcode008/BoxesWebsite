const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Add profile logic here
        res.json({ username: 'test', email: 'test@test.com' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;