const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String, // Contoh: 'image/png', 'application/pdf'
        required: true
    },
    size: {
        type: Number, // Ukuran file dalam bytes
        default: 0
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);