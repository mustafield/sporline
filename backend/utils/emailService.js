const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return null;

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });
    return transporter;
};

const sendLeadNotification = async (lead) => {
    const transport = getTransporter();
    const to = process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER;
    if (!transport || !to) {
        logger.warn('E-posta yapılandırması eksik, bildirim gönderilmedi.');
        return false;
    }

    try {
        await transport.sendMail({
            from: `"Sporline VIP" <${process.env.GMAIL_USER}>`,
            to,
            subject: `Yeni VIP Başvuru: ${lead.adSoyad}`,
            html: `
                <h2>Yeni VIP Üyelik Başvurusu</h2>
                <p><strong>Ad Soyad:</strong> ${lead.adSoyad}</p>
                <p><strong>Telefon:</strong> ${lead.telefon}</p>
                <p><strong>Branş:</strong> ${lead.brans}</p>
                <p><strong>Tarih:</strong> ${new Date(lead.createdAt).toLocaleString('tr-TR')}</p>
            `
        });
        logger.info('VIP başvuru bildirimi gönderildi', { leadId: lead._id });
        return true;
    } catch (err) {
        logger.error('E-posta gönderim hatası', { error: err.message });
        return false;
    }
};

module.exports = { sendLeadNotification };
