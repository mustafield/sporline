const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Bu kayıt zaten mevcut.' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Geçersiz token.' });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası oluştu.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Rota bulunamadı: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
