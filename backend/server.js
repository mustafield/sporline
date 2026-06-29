const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Admin enjeksiyonu için eklendi
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();
connectDB();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const contentRoutes = require('./routes/contentRoutes');
const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const seoRoutes = require('./routes/seoRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));
app.use(compression());

// --- CORS AYARI GÜNCELLENDİ (Üretim ortamında izinler genişletildi) ---
app.use(cors({
    origin: 'https://www.sporlinefitness.com.tr', // Sadece senin alan adından gelen isteklere izin ver
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // 'Cache-Control' başlığını allowedHeaders listesine ekledik
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Çok fazla istek. Lütfen bekleyin.' }
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
    next();
});

const rootDir = path.join(__dirname, '..');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));
app.use(express.static(rootDir, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', seoRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// =========================================================================
// GEÇİCİ ADMİN KULLANICI ENJEKTÖRÜ (GİRİŞ YAPTIKTAN SONRA SİLEBİLİRSİNİZ)
// =========================================================================
async function createDefaultAdmin() {
    try {
        const db = mongoose.connection.db;
        if (!db) {
            console.log('ℹ️ Veritabanı bağlantısı henüz hazır değil, tekrar deneniyor...');
            return;
        }

        const usersCollection = db.collection('users');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@sportlinefitness.com';
        const existingAdmin = await usersCollection.findOne({ email: adminEmail });

        if (!existingAdmin) {
            let bcrypt;
            try {
                bcrypt = require('bcryptjs');
            } catch (e) {
                bcrypt = require('bcrypt');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Sporline2026!', salt);

            await usersCollection.insertOne({
                name: process.env.ADMIN_NAME || 'Sporline Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('==================================================');
            console.log('✅ Varsayılan Admin Kullanıcısı Veritabanına Eklendi!');
            console.log(`📧 E-posta: ${adminEmail}`);
            console.log(`🔑 Şifre: ${process.env.ADMIN_PASSWORD || 'Sporline2026!'}`);
            console.log('==================================================');
        } else {
            console.log('ℹ️ Admin kullanıcısı veritabanında zaten mevcut.');
        }
    } catch (err) {
        console.error('❌ Geçici admin oluşturma hatası:', err.message);
    }
}
setTimeout(createDefaultAdmin, 4000);
// =========================================================================

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Sunucu ${PORT} portunda yayında`);
    console.log(`==================================================`);
    console.log(`🚀 Sporline Backend v2.0 - Port ${PORT}`);
    console.log(`🔒 JWT Auth | Helmet | Rate Limit | Cache`);
    console.log(`==================================================`);
});

module.exports = app;