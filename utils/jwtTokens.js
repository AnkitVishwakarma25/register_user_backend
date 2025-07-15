
const jwt = require('jsonwebtoken');

require('dotenv').config();

const generateAccessToken = (userId) => {

    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });


}
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};