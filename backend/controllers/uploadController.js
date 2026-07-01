const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Dosya seçilmedi" });

        const accountId = process.env.BYTESCALE_ACCOUNT_ID;
        const apiKey = process.env.BYTESCALE_API_KEY;

        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const safeBaseName = path
            .basename(req.file.originalname || 'upload')
            .replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}-${safeBaseName}`;

        const buildPublicUrl = (storedFileName) => {
            const host = `${req.protocol}://${req.get('host')}`;
            return `${host.replace(/\/$/, '')}/uploads/${storedFileName}`;
        };

        const isBytescaleReady = Boolean(accountId && apiKey);

        if (isBytescaleReady) {
            // Bytescale'e dosyayı yolluyoruz
            const response = await axios.post(
                `https://api.bytescale.com/v2/accounts/${accountId}/uploads/binary`,
                req.file.buffer,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': req.file.mimetype
                    }
                }
            );

            const remoteUrl = response?.data?.fileUrl || response?.data?.url || response?.data?.file?.url;
            if (remoteUrl) {
                return res.status(200).json({ success: true, url: remoteUrl });
            }
        }

        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(path.join(uploadsDir, fileName), req.file.buffer);

        // Yerel dosya kaydı: /uploads üzerinden servis edilir
        res.status(200).json({ success: true, url: buildPublicUrl(fileName) });
    } catch (err) {
        res.status(500).json({ success: false, message: "Yükleme hatası" });
    }
};