const jwt = require('jsonwebtoken');

// Fungsi mengecek keaslian token
exports.verifyToken = (req, res, next) => {
    // Ambil token dari header request
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });

    try {
        // Hapus kata 'Bearer ' jika ada, lalu verifikasi dengan kunci rahasia kita
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified; 
        next(); // Lanjut ke proses berikutnya jika token asli
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa!' });
    }
};

// Fungsi mengecek jabatan (Admin/Editor/Viewer)
exports.cekRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak, role kamu tidak diizinkan!' });
        }
        next();
    };
};