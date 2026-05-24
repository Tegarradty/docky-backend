const socketIo = require('socket.io');

let io;

module.exports = {
    // 1. Fungsi untuk menyalakan mesin WebSocket
    init: (server) => {
        io = socketIo(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:5173',
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('⚡ Client terhubung via WebSocket:', socket.id);

            socket.on('disconnect', () => {
                console.log('🔌 Client terputus:', socket.id);
            });
        });

        return io;
    },
    
    // 2. Fungsi untuk mengambil mesin penyiar ini dari file lain (seperti controller)
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io belum diinisialisasi!');
        }
        return io;
    }
};