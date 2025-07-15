

const express = require('express')

const router = express.Router();

const { registerUser, veriyOTP, resendOTP, login, forgetPasswordOtp, verifyresetotp, resetPassword } = require('../controllers/authcontroller')

const validateRegister = require('../middleware/validateRegister')


router.post('/register', validateRegister, registerUser);
router.post('/verify', veriyOTP);
router.post('/resend', resendOTP);
router.post('/login', login);
router.post('/forgetotp', forgetPasswordOtp);
router.post('/verifyresetotp', verifyresetotp);
router.post('/resetpassword', resetPassword);

module.exports = router;