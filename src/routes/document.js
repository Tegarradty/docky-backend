const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Semua rute dokumen wajib dijaga oleh satpam (verifyToken)
router.post('/', verifyToken, documentController.createDocument);
router.get('/', verifyToken, documentController.getDocuments);
// Rute pencarian wajib di atas rute /:id
router.get('/filter/search', verifyToken, documentController.getDocumentsByFilter); // Ini yang lama
router.get('/search/keyword', verifyToken, documentController.searchDocuments);     // INI YANG BARU
router.get('/:id', verifyToken, documentController.getDocumentById);
router.put('/:id', verifyToken, documentController.updateDocument);
router.delete('/:id', verifyToken, documentController.deleteDocument);

// Rute baru dari desain Figma
router.put('/:id/favorite', verifyToken, documentController.toggleFavorite);

module.exports = router;