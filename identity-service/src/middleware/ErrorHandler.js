import logger from "../util/logger.js";
 
export const errorHandler = (err,req,res,next) =>{
    logger.error(err.stack)
    res.status(err.status || 500).json({
        success:false,
        message:err.message || "Internal server error!"
    })
}