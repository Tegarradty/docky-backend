const User = require('../models/User');

// 1. Mengambil data profil sendiri
exports.getProfile = async (req, res) => {
    try {
        // Cari user berdasarkan ID (dari token), dan buang password_hash agar aman
        const user = await User.findById(req.user.id).select('-password_hash');
        
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        
        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil profil', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// 2. Mengupdate profil (Nama Lengkap, Username, dan Avatar)
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, username, avatar } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        // Terapkan perubahan jika ada data yang dikirim
        if (fullName) user.fullName = fullName;
        if (username) user.username = username;
        if (avatar) user.avatar = avatar; // Menerima URL string dari hasil upload asset

        await user.save();

        // Sembunyikan password_hash sebelum dikirim sebagai konfirmasi ke frontend
        user.password_hash = undefined;
        
        res.json({ message: 'Profil berhasil diperbarui!', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui profil', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};