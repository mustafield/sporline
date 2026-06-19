const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.loginValidation = [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz.'),
    body('password').notEmpty().withMessage('Şifre gereklidir.')
];

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Hesabınız devre dışı bırakılmış.' });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        logger.info('Admin girişi', { email: user.email });

        res.json({
            success: true,
            data: {
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};

exports.registerValidation = [
    body('name').trim().notEmpty().withMessage('İsim gereklidir.'),
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz.'),
    body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalıdır.')
];

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Bu e-posta zaten kayıtlı.' });
        }

        const user = await User.create({ name, email, password, role: role || 'editor' });
        logger.info('Yeni kullanıcı oluşturuldu', { email });

        res.status(201).json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};
