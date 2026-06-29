const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();
connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));
app.use(compression());

// --- GÜNCELLENMİŞ CORS AYARI ---
app.use(cors({
    origin: 'https://www.sporlinefitness.com.tr',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// --- STATİK KLASÖR TANIMI (Resimler için zorunlu) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));

// Rotalar
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/seo', require('./routes/seoRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Sunucu ${PORT} portunda yayında`);
    console.log(`🚀 Sporline Backend v2.0 - Port ${PORT}`);
});