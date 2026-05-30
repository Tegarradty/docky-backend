// Ganti exec menjadi spawn
const { spawn } = require('child_process'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// Panggil mesin siaran ke dalam sandbox
const websocketService = require('./websocketService'); 

exports.runCode = (language, sourceCode, socketId) => {
    return new Promise((resolve) => {
        const fileId = crypto.randomBytes(8).toString('hex');
        const ext = language === 'python' ? 'py' : 'js';
        const filename = `temp_${fileId}.${ext}`;
        
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, sourceCode);

        // Jika menggunakan spawn, perintah dipisah menjadi array
        const args = [
            'run', '--rm', '-i',
            '--memory=128m', '--cpus=0.5', '--network', 'none', '--read-only',
            '-v', `${filePath}:/app/${filename}:ro`,
            'docky-sandbox',
            language === 'python' ? 'python3' : 'node',
            `/app/${filename}`
        ];

        if (language !== 'python' && language !== 'nodejs') {
            fs.unlinkSync(filePath);
            return resolve({ success: false, output: 'Error: Bahasa tidak didukung.' });
        }

        // Eksekusi docker dengan spawn
        const proc = spawn('docker', args);
        let fullOutput = ''; // Simpan seluruh output untuk dicatat ke database nanti

        // Ambil pemancar WebSocket
        let io;
        try { io = websocketService.getIo(); } catch (e) {}

        // STREAMING: Setiap kali Docker mencetak 1 baris, langsung siarkan ke frontend!
        proc.stdout.on('data', (chunk) => {
            const text = chunk.toString();
            fullOutput += text;
            // Kirim HANYA ke user yang menekan tombol (socketId)
            if (io && socketId) io.to(socketId).emit('execution_output', text);
        });

        // STREAMING: Jika ada error dari kode (misal: syntax error)
        proc.stderr.on('data', (chunk) => {
            const text = chunk.toString();
            fullOutput += text;
            if (io && socketId) io.to(socketId).emit('execution_error', text);
        });

        // Batas Waktu Manual (10 detik)
        const timeoutId = setTimeout(() => {
            proc.kill(); // Tembak mati containernya
            const errorMsg = '\nError: Execution Timed Out (Melebihi batas 10 detik)';
            fullOutput += errorMsg;
            if (io && socketId) io.to(socketId).emit('execution_error', errorMsg);
            
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve({ success: false, output: fullOutput });
        }, 10000);

        // Saat eksekusi benar-benar selesai
        proc.on('close', (code) => {
            clearTimeout(timeoutId); // Batalkan timer kematian
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            
            if (io && socketId) io.to(socketId).emit('execution_done', { exitCode: code });
            resolve({ success: code === 0, output: fullOutput });
        });
    });
};