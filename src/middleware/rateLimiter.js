const rateLimit = require('express-rate-limit');

// 1. Satpam Khusus Eksekusi Kode (Maksimal 5x per 1 menit)
exports.executionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: { message: 'Terlalu banyak request eksekusi. Mesin sedang mendinginkan diri, silakan tunggu 1 menit.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// 2. Satpam Umum untuk API Lainnya (Maksimal 100 request per 15 menit)
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: 'Trafik sedang tinggi. Silakan coba lagi nanti.' }
});