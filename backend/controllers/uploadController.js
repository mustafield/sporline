const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|webp|gif|mp4|webm|svg)$/i;
    const allowedMime = /^(image\/(jpeg|jpg|png|webp|gif|svg\+xml)|video\/(mp4|webm))$/i;
    const ext = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMime.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Desteklenmeyen dosya formatı.'), false);
};

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter
});

exports.uploadFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Dosya yüklenmedi.' });
    }

    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
        success: true,
        data: {
            url,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        }
    });
};

exports.uploadMiddleware = upload.single('file');
