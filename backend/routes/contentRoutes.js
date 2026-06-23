const express = require('express');
const router = express.Router();
const { getContent, updateContent, updateSection, contentStream } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stream', contentStream);
router.get('/', getContent);
router.post('/', protect, authorize('admin', 'editor'), updateContent);
router.patch('/:section', protect, authorize('admin', 'editor'), updateSection);

module.exports = router;
