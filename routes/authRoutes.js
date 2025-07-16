

const express = require('express')

const router = express.Router();

const { registerUser, veriyOTP, resendOTP, login, forgetPasswordOtp, verifyresetotp, resetPassword, getCurrentUser, refreshAccessToken, logOut } = require('../controllers/authcontroller')

const validateRegister = require('../middleware/validateRegister')
const authMiddleware = require('../middleware/checkAccessTokenMiddleware')
const checkRefreshToken = require('../middleware/checkRefreshTokenMiddleware')


router.post('/register', validateRegister, registerUser); //for register
router.post('/verify', veriyOTP); // this verify the otp
router.post('/resend', resendOTP); //resend otp for register
router.post('/login', login); //for login 
router.post('/forgetotp', forgetPasswordOtp);//this send a otp for reset password
router.post('/verifyresetotp', verifyresetotp);// this check otp for reset password
router.post('/resetpassword', resetPassword); // for reset password
router.get('/getme', authMiddleware, getCurrentUser); //if logged in then direct you land to loggedin dashboard
router.get('/refreshAccess', checkRefreshToken, refreshAccessToken)
router.post('/logout', logOut) //logout user 
module.exports = router;