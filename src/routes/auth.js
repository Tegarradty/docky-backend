const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Menyambungkan URL ke fungsi yang sudah kamu buat di authController
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;