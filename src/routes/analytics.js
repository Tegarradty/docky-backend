const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rute ini memakai GET karena kita hanya membaca/meminta data angka
router.get('/', verifyToken, analyticsController.getDashboardStats);

module.exports = router;