import logger from "../utils/logger.js";

export const authenticationRequest = (req,res,next) => {
    const userId = req.headers['x-user-id']

    if(!userId){
        logger.warn("Access attempt without user Id!")

        res.status(401).json({
            success:false,
            message:"Authentication required! please login!"
        })
    }

    req.user = {userId}
    next()
}   