
const jwt = require('jsonwebtoken');

const Token = require('../models/Tokens')

const checkRefreshToken = async (req, res, next) => {

    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken)
            return res.status(401).json({ message: "refreshToken missing" });

        const checkInDb = await Token.findOne({ refreshToken });

        if (!checkInDb)
            return res.status(403).json({ message: "refresh token not recognised " })

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {

            if (err) {
                return res.status(403).json({ message: 'Expired or invalid refresh token' });
            }

            req.userId = decoded.userId;
            next();

        });


    } catch (error) {

        console.error('checkRefresh error ', error);
        res.status(500).json({ message: "Internal server error " })

    }

};

module.exports = checkRefreshToken;