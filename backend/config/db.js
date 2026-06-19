const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000
        });
        console.log(`MongoDB bağlantısı başarılı -> ${conn.connection.host}`);
    } catch (error) {
        console.error(`Veritabanı bağlantı hatası: ${error.message}`);
        console.error('MongoDB çalışmıyor olabilir. Servisi başlatın: mongod veya "net start MongoDB"');
        process.exit(1);
    }
};

module.exports = connectDB;