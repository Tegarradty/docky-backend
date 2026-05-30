const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Asset = require('../models/Asset');

// 1. Pastikan folder 'uploads' tersedia
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Konfigurasi penyimpanan Multer (Kapan dan di mana file disimpan)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Membuat nama file unik: WaktuSekarang-AngkaAcak.ekstensi
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

// 3. Aturan kurir (Batas maksimal 5MB)
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
}).single('file_asset'); // 'file_asset' adalah kunci form dari frontend

// 4. Fungsi Utama Upload
exports.uploadAsset = (req, res) => {
    upload(req, res, async (err) => {
        // Cek jika ada error dari kurir (misal file kebesaran)
        if (err) {
            return res.status(400).json({ message: 'Gagal upload file', error: err.message });
        }
        // Cek jika user lupa melampirkan file
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        try {
            // Simpan jejak file ke database MongoDB
            const newAsset = new Asset({
                id_user: req.user.id,
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}`, // Ini URL yang akan dipakai oleh Frontend
                type: req.file.mimetype,
                size: req.file.size
            });

            await newAsset.save();
            res.status(201).json({ message: 'File berhasil diunggah!', data: newAsset });
        } catch (error) {
            res.status(500).json({ message: 'Gagal menyimpan data asset', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    });
};
// 5. Mengambil semua asset milik user
exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ id_user: req.user.id }).sort({ createdAt: -1 });
        res.json({ data: assets });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data asset', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 6. Menghapus asset
exports.deleteAsset = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Cari dan hapus datanya dari database
        const asset = await Asset.findOneAndDelete({ _id: req.params.id, id_user: req.user.id });
        if (!asset) return res.status(404).json({ message: 'Asset tidak ditemukan atau akses ditolak' });

        // Hapus file fisiknya dari folder uploads agar hardisk tidak penuh
        const filePath = path.join(__dirname, '../../', asset.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Asset beserta file fisiknya berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus asset', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};