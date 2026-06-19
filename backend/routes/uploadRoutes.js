const express = require('express');
const router = express.Router();
const { uploadFile, uploadMiddleware } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin', 'editor'), (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        next();
    });
}, uploadFile);

module.exports = router;
