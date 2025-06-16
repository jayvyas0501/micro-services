import dotenv from "dotenv/config"
import express from "express"
import mongoose from "mongoose"
import Redis from "ioredis"
import cors from "cors"
import helmet from "helmet"
import logger from "./utils/logger.js"
import { errorHandler } from "./middleware/ErrorHandler.js"
import postRoutes from "./routes/post.route.js" // ✅ Add this

const app = express()
const PORT = process.env.PORT || 3002;

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => logger.info('Connected to mongoDB'))
  .catch((e) => logger.error('Mongoose connection error:', e))

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`)
  if (Object.keys(req.body).length > 0) {
    logger.info(`Request body: ${JSON.stringify(req.body)}`)
  }
  next()
})

app.use('/api/posts', (req, res, next) => {
  req.redisClient = redisClient
  next()
}, postRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Post service running on port ${PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason)
})
