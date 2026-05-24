const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Terhubung ke Database MongoDB');
    } catch (err) {
        console.error('❌ Gagal terhubung ke MongoDB:', err);
        process.exit(1);
    }
};

module.exports = connectDB;