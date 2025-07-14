

const express = require('express')

const router = express.Router();

const { registerUser, veriyOTP, resendOTP } = require('../controllers/authcontroller')

const validateRegister = require('../middleware/validateRegister')


router.post('/register', validateRegister, registerUser);
router.post('/verify', veriyOTP);
router.post('/resend', resendOTP);

module.exports = router;