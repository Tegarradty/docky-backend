const mongoose = require('mongoose');
const Document = require('../models/Document');

// 1. Membuat Dokumen Baru
exports.createDocument = async (req, res) => {
    try {
        // Ambil SEMUA data yang dikirim dari form Figma
        const { judul, struktur_blok_json, status, accessMode, category, tags, description, isFavorite } = req.body;
        
        const newDoc = new Document({
            id_user: req.user.id, // Didapat otomatis dari token JWT
            judul: judul || 'Dokumen Tanpa Judul',
            struktur_blok_json: struktur_blok_json || [],
            // Tambahan data dari Figma
            status: status || 'Draft',
            accessMode: accessMode || 'Private',
            category: category || 'Uncategorized',
            tags: tags || [],
            description: description || '',
            isFavorite: isFavorite || false
        });

        await newDoc.save();
        res.status(201).json({ message: 'Dokumen berhasil dibuat!', data: newDoc });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 2. Mengambil Semua Dokumen milik User yang sedang login
exports.getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ id_user: req.user.id }).sort({ updatedAt: -1 });
        res.json({ data: docs });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 3. Mengambil Satu Dokumen secara Spesifik
exports.getDocumentById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Format ID Dokumen tidak valid' });
        }

        const doc = await Document.findOne({ _id: req.params.id, id_user: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Dokumen tidak ditemukan' });
        
        res.json({ data: doc });
    }
     catch (error) {
        res.status(500).json({ message: 'Gagal mengambil dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 4. Mengupdate Dokumen
// 4. Mengupdate Dokumen & Menyimpan Riwayat Revisi
exports.updateDocument = async (req, res) => {
    try {
        // Ambil semua data yang mungkin dikirim user, termasuk dari desain Figma
        const { judul, struktur_blok_json, status, accessMode, category, tags, description } = req.body;
        
        // 1. Cari dokumen lama terlebih dahulu
        const doc = await Document.findOne({ _id: req.params.id, id_user: req.user.id });
        
        if (!doc) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan atau akses ditolak' });
        }

        // 2. Buat ID revisi unik
        const revision_id = `rev_${Date.now()}`;

        // 3. Simpan isi dokumen lama ke dalam array riwayat_dokumen
        doc.riwayat_dokumen.push({
            revision_id: revision_id,
            diff_content: doc.struktur_blok_json, 
            timestamp: new Date()
        });

        // 4. Terapkan perubahan baru
        if (judul) doc.judul = judul;
        if (struktur_blok_json) doc.struktur_blok_json = struktur_blok_json;
        
        // Tambahan data dari Figma
        if (status) doc.status = status;
        if (accessMode) doc.accessMode = accessMode;
        if (category) doc.category = category;
        if (tags) doc.tags = tags;
        if (description) doc.description = description;

        // 5. Simpan semuanya ke database
        await doc.save();

        res.json({ message: 'Dokumen berhasil diupdate dan revisi disimpan!', data: doc });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menyimpan dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 5. Menghapus Dokumen
exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findOneAndDelete({ _id: req.params.id, id_user: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Dokumen tidak ditemukan atau akses ditolak' });

        res.json({ message: 'Dokumen berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
// 6. Mengambil Dokumen dengan Filter (Kategori, Status, dll)
exports.getDocumentsByFilter = async (req, res) => {
    try {
        const { status, category, isFavorite } = req.query;
        let query = { id_user: req.user.id };

        // Tambahkan filter jika user mengirimkannya
        if (status) query.status = status;
        if (category) query.category = category;
        if (isFavorite) query.isFavorite = isFavorite === 'true';

        const docs = await Document.find(query).sort({ updatedAt: -1 });
        res.json({ data: docs });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil dokumen', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 7. Toggle (Buka/Tutup) Status Favorit
exports.toggleFavorite = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, id_user: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Dokumen tidak ditemukan' });

        doc.isFavorite = !doc.isFavorite; // Membalikkan status (true jadi false, sebaliknya)
        await doc.save();

        res.json({ message: doc.isFavorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', data: doc });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengubah status favorit', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
// 8. Mencari Dokumen berdasarkan Keyword (Judul, Deskripsi, Tags)
exports.searchDocuments = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({ message: 'Keyword pencarian tidak boleh kosong' });
        }

        // Cari dokumen yang mengandung keyword (case-insensitive)
        const regex = new RegExp(keyword, 'i');
        
        const docs = await Document.find({ 
            id_user: req.user.id,
            $or: [
                { judul: regex },
                { description: regex },
                { tags: { $in: [regex] } }
            ]
        }).sort({ updatedAt: -1 });

        res.json({ message: `Ditemukan ${docs.length} hasil`, data: docs });
    } catch (error) {
        res.status(500).json({ message: 'Gagal melakukan pencarian', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};