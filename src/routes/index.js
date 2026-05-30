const express = require('express');
const router = express.Router();

// 1. Panggil semua "Jalan Raya" yang sudah kamu buat
const authRoutes = require('./auth');
const userRoutes = require('./user');
const documentRoutes = require('./document');
const assetRoutes = require('./asset');
const executionRoutes = require('./execution');
const analyticsRoutes = require('./analytics');

// 2. Daftarkan semuanya ke dalam Terminal Pusat ini
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/assets', assetRoutes);
router.use('/execution', executionRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;