const Document = require('../models/Document');
const Asset = require('../models/Asset');
const ExecutionLog = require('../models/ExecutionLog');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Hitung total semua dokumen
        const totalDocuments = await Document.countDocuments({ id_user: userId });

        // 2. Hitung dokumen favorit
        const favoriteDocuments = await Document.countDocuments({ id_user: userId, isFavorite: true });

        // 3. Hitung dokumen berdasarkan status (Draft & Published)
        const draftCount = await Document.countDocuments({ id_user: userId, status: 'Draft' });
        const publishedCount = await Document.countDocuments({ id_user: userId, status: 'Published' });

        // 4. Hitung total seluruh revisi dari semua dokumen user
        const allUserDocs = await Document.find({ id_user: userId });
        let totalRevisions = 0;
        allUserDocs.forEach(doc => {
            totalRevisions += doc.riwayat_dokumen.length;
        });

        // 5. Hitung total asset gambar
        const totalAssets = await Asset.countDocuments({ id_user: userId });
        const totalExecutions = await ExecutionLog.countDocuments({ id_user: userId });

        res.json({
            message: "Statistik Dashboard berhasil diambil",
            data: {
                totalDocuments,
                favoriteDocuments,
                draftCount,
                publishedCount,
                totalRevisions,
                totalAssets,
                totalExecutions,
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Gagal mengambil data statistik', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};