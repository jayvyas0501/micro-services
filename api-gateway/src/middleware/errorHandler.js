import logger from "../util/logger.js";

const errorHandler = (err,req,res,next) =>{
    logger.error(err.stack)
    res.status(err.status || 500).json({
        success:false,
        message:err.message || "Internal server error!"
    })
}

export default errorHandler