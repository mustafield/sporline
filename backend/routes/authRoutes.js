const express = require('express');
const router = express.Router();
const { login, getMe, register, loginValidation, registerValidation } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin'), registerValidation, validate, register);

module.exports = router;
