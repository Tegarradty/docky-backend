const sandboxService = require('../services/sandboxService');
const ExecutionLog = require('../models/ExecutionLog');

exports.executeCode = async (req, res) => {
    try {
        // 1. Terima data dari frontend (termasuk socketId untuk WebSocket real-time)
        const { language, source_code, socketId } = req.body;

        if (!language || !source_code) {
            return res.status(400).json({ message: 'Language dan source_code wajib diisi' });
        }

        // 2. Validasi bahasa yang didukung (Whitelist)
        const ALLOWED_LANGUAGES = ['python', 'nodejs'];
        if (!ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
            return res.status(400).json({ message: 'Bahasa tidak didukung. Gunakan python atau nodejs.' });
        }

        // 3. Kirim kode dan socketId ke ruang isolasi Sandbox (Docker menggunakan spawn)
        const result = await sandboxService.runCode(language.toLowerCase(), source_code, socketId);

        // 4. Catat riwayat eksekusi ke database (ExecutionLog)
        const newLog = new ExecutionLog({
            id_user: req.user.id,
            language: language.toLowerCase(),
            source_code: source_code,
            output: result.output,
            isSuccess: result.success
        });
        await newLog.save();

        // 5. Kirim respon akhir ke Postman / Frontend HTTP
        res.json({ 
            message: 'Proses eksekusi selesai dicatat', 
            data: { success: result.success } 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Gagal mengeksekusi kode', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};