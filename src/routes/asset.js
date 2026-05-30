const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rute untuk mengunggah aset (harus melewati satpam verifyToken)
router.post('/upload', verifyToken, assetController.uploadAsset);
// Rute baru untuk mengambil dan menghapus asset
router.get('/', verifyToken, assetController.getAssets);
router.delete('/:id', verifyToken, assetController.deleteAsset);

module.exports = router;