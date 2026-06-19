const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLeadStatus, deleteLead } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { contactValidation, leadStatusValidation } = require('../validators/contactValidator');
const rateLimit = require('express-rate-limit');

const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Çok fazla başvuru gönderdiniz. Lütfen daha sonra tekrar deneyin.' }
});

router.post('/', formLimiter, contactValidation, validate, createLead);
router.get('/', protect, authorize('admin', 'editor'), getLeads);
router.put('/:id', protect, authorize('admin', 'editor'), leadStatusValidation, validate, updateLeadStatus);
router.delete('/:id', protect, authorize('admin'), deleteLead);

module.exports = router;
