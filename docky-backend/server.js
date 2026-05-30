const http = require('http');
const websocketService = require('./src/services/websocketService');
require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./src/config/db');

// Jalankan koneksi database
connectDB();

// Deklarasi port cukup satu kali saja
const PORT = process.env.PORT || 3000;

// Membungkus app Express dengan HTTP server bawaan Node.js
const server = http.createServer(app);

// Menyalakan koneksi WebSocket
websocketService.init(server);

// Jalankan menggunakan server.listen (app.listen sudah dihapus)
server.listen(PORT, () => {
    console.log(`🚀 Server dan WebSocket berjalan di port ${PORT}`);
});