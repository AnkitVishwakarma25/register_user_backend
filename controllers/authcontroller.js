const User = require("../models/User");  //for User Schema.
const bcrypt = require("bcryptjs");

const sendEmail = require('../utils/sendOTP');
const { response } = require("express");

const Token = require('../models/Tokens'); //for Token Schema.

const { generateAccessToken, generateRefreshToken } = require('../utils/jwtTokens'); //accessToken and refreshToken

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: "Email already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpire: Date.now() + 5 * 60 * 1000,
        });

        await sendEmail(email, "Your OTP ", `Your OTP is: ${otp}`);
        res.status(201).json({ message: "OTP send to your email verify first !" });


    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
};

const veriyOTP = async (req, res) => {


    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.isVerified) return res.json({ message: "User already verified." });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully." });
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
};



//resendOTP

const resendOTP = async (req, res) => {

    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.isVerified)
            return res.status(400).json({ message: "User already verified." });

        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 min

        user.otp = newOTP;
        user.otpExpires = otpExpires;
        await user.save();

        await sendEmail(email, "Your OTP (Resent)", `Your new OTP is: ${newOTP}`);

        res.json({ message: "OTP resent successfully to your email." });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

//login 
const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "user not found please fill correct email" })

        if (!user.isVerified)
            return res.status(400).json({ message: "user not verified" });

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return res.status(400).json({ message: "Wrong password !" })

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        await Token.findOneAndUpdate(
            { userID: user._id },
            { refreshToken: refreshToken },
            { upsert: true, new: true }  // create if not exists, return updated doc
        );

        res
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .json({
                message: " Login successfull !",
                user: {
                    id: user._id,
                    email: user.email,
                }
            })

    } catch (error) {
        console.error("Internal ServerError", error);
        res.json("something went wrong ")

    }


}

const forgetPasswordOtp = async (req, res) => {

    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (!user.isVerified)
            return res.status(400).json({ message: "Please complete verification first" });

        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 min

        user.otp = newOTP;
        user.otpExpires = otpExpires;
        await user.save();

        await sendEmail(email, "Your OTP ", `Your reset-password OTP is: ${newOTP}`);

        res.json({ message: "OTP sent successfully to your email." });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

const verifyresetotp = async (req, res) => {

    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "user not exists" });

        if (!user.isVerified) return res.json({ message: "please verify your email" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        await Token.create({
            userID: user._id,
            refreshToken: refreshToken,
        })

        res
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .json({
                message: " Login successfull !",
                user: {
                    id: user._id,
                    email: user.email,
                }
            })

    } catch (error) {
        console.error("Internal Error", error)
        res.status(500).json("Internal server error");

    }


}

const resetPassword = async (req, res) => {

    try {
        const { email, newpassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "user not exists" });

        if (!user.isVerified) return res.status(400).json({ message: "user not verified " })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "password change successfully"
        })
    } catch (error) {

        console.error("Internal error !")
        res.status(500).json({ message: "Internal Server Error" })

    }
}




const getCurrentUser = async (req, res) => {

    try {
        const user = await User.findById(req.userId).select('_id email');

        if (!user)
            return res.status(400).json({ loggedIn: false, user: null })

        res.json({
            loggedIn: true,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {

        console.error('getCurrentUser error', error);
        res.status(500).json({ loggedIn: false, user: null })

    }
}

const refreshAccessToken = async (req, res) => {

    try {
        const user = await User.findById(req.userId).select('_id email');

        if (!user)
            return res.status(404).json({ message: 'user not found' });

        const newAccessToken = generateAccessToken(user._id);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        });

        return res.json({
            message: "Access Token refreshed !",
            loggedIn: true,
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {

        console.error("refreshAccessToken error", error);
        res.status(500).json({ message: "Internal server error" })


    }


}

const logOut = async (req, res) => {

    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {

            await Token.deleteOne({ refreshToken })

        }

        res.clearCookie('accessToken', {
            httpOnly: true,
            // sameSite: 'strict',
            //secure: process.env.NODE_ENV === 'production'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
        });

        return res.json({ message: "User Logged Out Successfully" });
    } catch (error) {

        console.error("Logout error", error);

        return res.status(500).json({ message: "Internal server error " })

    }
}


module.exports = {
    registerUser,
    veriyOTP,
    resendOTP,
    login,
    forgetPasswordOtp,
    verifyresetotp,
    resetPassword,
    getCurrentUser,
    refreshAccessToken,
    logOut,
}