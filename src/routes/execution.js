const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint untuk menjalankan kode
router.post('/run', verifyToken, executionController.executeCode);

module.exports = router;