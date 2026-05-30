const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Menggunakan bcryptjs yang ringan
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Modul bawaan Node.js untuk membuat token acak
const { sendResetEmail } = require('../services/emailService'); // Mesin email kita

// --- Logika Register ---
exports.register = async (req, res) => {
    try {
        // 1. Ambil datanya dulu dari req.body (Paling Atas)
      const { fullName, username, email, password } = req.body;

        // 2. Cek kekosongan
       if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'Semua data (fullName, username, email, password) wajib diisi!' });
}

        // 3. Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Format email tidak valid!' });
        }

        // 4. Validasi panjang password
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password minimal 8 karakter!' });
        }

        // 5. Cek apakah email sudah terdaftar sebelumnya
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah digunakan!' });
        }

        // 6. Enkripsi (Hash) password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 7. Simpan user baru ke database
      const newUser = new User({
           fullName, // Ini tambahan barunya
           username,
           email,
           password_hash
        });
        await newUser.save();
        res.status(201).json({ message: 'User berhasil didaftarkan!' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

// --- Logika Login ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi!' });
        }

        // 1. Cari user berdasarkan email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        // 2. Cocokkan password yang diinput dengan yang ada di database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        // 3. Buat Token JWT (tiket akses)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );

        res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
// 3. Fitur Lupa Password (Lupa Sandi)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Email tidak ditemukan di sistem kami' });
        }

        // Buat token acak (Kunci gembok 1 kali pakai)
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Simpan kunci gembok ke dalam database dengan masa aktif 1 jam
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        // Panggil kurir email
        await sendResetEmail(user.email, resetToken);

        res.json({ message: 'Instruksi reset password telah dikirim ke email Anda! (Cek terminal VS Code)' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses lupa password', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
// 4. Fitur Reset Password (Menerima password baru)
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Cari user yang punya token tersebut dan tokennya belum expired (> Date.now)
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
        }

        // Enkripsi password baru
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        
        // Hapus token karena sudah dipakai (keamanan)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password berhasil direset! Silakan login dengan password baru.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mereset password', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};