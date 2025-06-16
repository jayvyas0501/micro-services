import logger from "../util/logger.js"
import jwt from "jsonwebtoken"


const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if (!token) {
        logger.warn('Attempt without valid token!')
        return res.status(401).json({
            success: false,
            message: 'Authenticatoin required!'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn('Invalid Token!')
            return res.status(429).json({
                success: false,
                message: 'Invalid token!'
            })
        }
        req.use = user
        next()
    })
}

export default validateToken 