const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    judul: {
        type: String,
        default: 'Dokumen Tanpa Judul'
    },
    struktur_blok_json: {
        type: Array, 
        default: []
    },
    riwayat_dokumen: [
        {
            revision_id: { type: String },
            diff_content: { type: Array },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    // --- 6 Kolom Baru Berdasarkan Desain Figma ---
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Draft'
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    accessMode: {
        type: String,
        // Ubah bagian enum ini menyesuaikan desain Figma:
        enum: ['Private', 'Shared', 'Team'], 
        default: 'Private'
    },
    category: {
        type: String,
        default: 'Uncategorized'
    },
    tags: {
        type: [String], // Array berisi teks
        default: []
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);