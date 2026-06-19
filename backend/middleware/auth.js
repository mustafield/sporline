const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Yetkilendirme gerekli.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Geçersiz veya pasif kullanıcı.' });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Oturum süresi doldu veya geçersiz token.' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    }
    next();
};

module.exports = { protect, authorize };
