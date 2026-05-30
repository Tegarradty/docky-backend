const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware Global
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json()); // Agar backend bisa membaca data JSON dari frontend

// 1. Pasang satpam umum (Rate Limiter) untuk seluruh API
const { apiLimiter } = require('./src/middleware/rateLimiter');
app.use('/api/', apiLimiter);

// 2. Panggil Terminal Pusat Rute (Ini sudah merangkum auth, user, document, asset, dll)
const routes = require('./src/routes'); 
app.use('/api', routes);

// 3. Folder fisik untuk aset
app.use('/uploads', express.static('uploads'));

// Route dasar untuk tes awal
app.get('/', (req, res) => {
    res.json({ message: "Server DOCKY API berjalan dengan baik!" });
});

// JARING PENGAMAN ERROR (Wajib ditaruh paling akhir)
// JARING PENGAMAN ERROR (Wajib ditaruh paling akhir)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan internal pada server!' 
    });
});

module.exports = app;