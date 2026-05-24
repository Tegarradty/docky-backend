const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: { 
        type: String, 
        required: true,
        unique: true, // Tambahan
        trim: true    // Tambahan
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,       // Tambahan
        lowercase: true   // Tambahan
    },
avatar: {
        type: String,
        default: '' // Default kosong kalau user belum pasang foto
    },
    password_hash: { 
        type: String, 
        required: true 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: { 
        type: String, 
        enum: ['Admin', 'Editor', 'Viewer'], 
        default: 'Viewer' 
    }
}, { timestamps: true }); // Otomatis menambahkan waktu buat (createdAt) & update (updatedAt)

module.exports = mongoose.model('User', userSchema);