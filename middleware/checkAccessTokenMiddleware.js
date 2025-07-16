
const jwt = require('jsonwebtoken');


const authMiddleware = async (req, res, next) => {


    try {
        let token = req.cookies?.accessToken;

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {

            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: "no token , user not authorized !" });

        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.userId = decoded.userId;

        next();
    } catch (error) {

        console.error("Auth Middleware error ", error);
        return res.status(401).json({ message: "Invalide or Expired Token " })

    }

}

module.exports = authMiddleware;