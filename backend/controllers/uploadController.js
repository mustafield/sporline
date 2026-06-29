const axios = require('axios');
const multer = require('multer');
const upload = multer(); // RAM üzerinden işlem yapar

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Dosya seçilmedi" });

        const accountId = process.env.BYTESCALE_ACCOUNT_ID;
        const apiKey = process.env.BYTESCALE_API_KEY;

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

        // Bulut bize kalıcı bir link veriyor, biz de onu siteye geri veriyoruz
        res.status(200).json({ success: true, url: response.data.fileUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Yükleme hatası" });
    }
};