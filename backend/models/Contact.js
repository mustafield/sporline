const mongoose = require('mongoose');

// Müşterinin formdan göndereceği bilgilerin şablonu
const ContactSchema = new mongoose.Schema({
    adSoyad: { 
        type: String, 
        required: true 
    },
    telefon: { 
        type: String, 
        required: true 
    },
    brans: { 
        type: String, 
        required: true 
    },
    durum: { 
        type: String, 
        enum: ['Beklemede', 'Arandı', 'İptal'], 
        default: 'Beklemede' // Yeni gelen form otomatik olarak 'Beklemede' başlar
    }
}, { timestamps: true }); // timestamps sayesinde formun geldiği tarih ve saat otomatik kaydedilir

// Mesaj alanı eklendi
ContactSchema.add({
    mesaj: { type: String, trim: true }
});

module.exports = mongoose.model('Contact', ContactSchema);