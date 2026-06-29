const Contact = require('../models/Contact');
const { sendLeadNotification } = require('../utils/emailService');
const logger = require('../utils/logger');

exports.createLead = async (req, res, next) => {
    try {
        const { adSoyad, telefon, brans, mesaj } = req.body;
        const newLead = new Contact({ adSoyad, telefon, brans, mesaj });
        await newLead.save();

        sendLeadNotification(newLead).catch(() => {});
        logger.info('Yeni VIP başvuru', { adSoyad, brans });

        res.status(201).json({
            success: true,
            message: 'VIP Başvurunuz başarıyla iletildi!',
            data: newLead
        });
    } catch (err) {
        next(err);
    }
};

exports.getLeads = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const filter = status ? { durum: status } : {};
        const skip = (page - 1) * limit;

        const [leads, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Contact.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: leads,
            pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { durum } = req.body;

        const updatedLead = await Contact.findByIdAndUpdate(id, { durum }, { new: true });
        if (!updatedLead) {
            return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
        }

        res.status(200).json({ success: true, message: 'Durum güncellendi.', data: updatedLead });
    } catch (err) {
        next(err);
    }
};

exports.deleteLead = async (req, res, next) => {
    try {
        const lead = await Contact.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
        }
        res.status(200).json({ success: true, message: 'Talep silindi.' });
    } catch (err) {
        next(err);
    }
};
