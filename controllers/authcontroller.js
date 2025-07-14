const User = require("../models/User");
const bcrypt = require("bcryptjs");

const sendEmail = require('../utils/sendOTP');
const { response } = require("express");

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

module.exports = {
    registerUser,
    veriyOTP,
    resendOTP,
}