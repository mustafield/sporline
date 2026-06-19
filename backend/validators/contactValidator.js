const { body } = require('express-validator');

exports.contactValidation = [
    body('adSoyad').trim().notEmpty().withMessage('Ad soyad gereklidir.').isLength({ max: 100 }),
    body('telefon').trim().notEmpty().withMessage('Telefon gereklidir.').matches(/^[0-9+\s()-]{10,20}$/).withMessage('Geçerli bir telefon numarası giriniz.'),
    body('brans').trim().notEmpty().withMessage('Branş seçimi gereklidir.')
];

exports.leadStatusValidation = [
    body('durum').isIn(['Beklemede', 'Arandı', 'İptal']).withMessage('Geçersiz durum.')
];
