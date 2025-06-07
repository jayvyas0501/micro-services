import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import helmet from "helmet"
import cors from "cors"
import logger from "./util/logger.js"
import { RateLimiterRedis } from "rate-limiter-flexible"
import Redis from "ioredis"
import rateLimit from "express-rate-limit"
import {RedisStore} from "rate-limit-redis"
import routes from "./routes/identity-service.js"
import { errorHandler } from "./middleware/ErrorHandler.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

mongoose.connect(process.env.MONGO_URL).then(()=> logger.info('Connected to mongoDB')).catch(e=>logger.error('Mongoose connection error :',e))

const redisClient = new Redis(process.env.REDIS_URL)

//Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
  }
  next();
});


//error handler
app.use((err, req, res, next) => {
  logger.error('Error occurred:', err);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!"
  });
});


const ratelimiter = new RateLimiterRedis({
  storeClient : redisClient,
  keyPrefix : 'middleware',
  points:10,
  duration : 1
})

app.use((req,res,next)=>{
  ratelimiter.consume(req.ip).then(() => {next()}).catch(()=>{
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.statusMessage(429).json({success:false,message:"too many requests"})

  })
})

const sensitiveEndpointsLimiter =  rateLimit({
  windowMs: 15*60*1000,
  max:50,
  standardHeaders:true,
  legacyHeaders:false,
  handler: (req,res) =>{
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}!`)
  res.statusMessage(429).json({success:false,message:"too many requests"})  
  },
  store : new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  })
})

app.use('/api/auth/register',sensitiveEndpointsLimiter)


app.use('/api/auth',routes)

app.use(errorHandler)

app.listen(PORT,()=>{
  logger.info("Identity service is running")
})

//unhandled promise rejection

process.on('unhandledRejection',(reason,promise)=>{
  logger.error("Unhandled Rejection at ",promise, "reason :",reason)
})