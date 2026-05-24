const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, required: true },
    source_code: { type: String, required: true },
    output: { type: String, required: true },
    isSuccess: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ExecutionLog', executionLogSchema);