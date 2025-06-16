import express from "express"
import { authenticationRequest } from "../middleware/auth.middleware.js"
import { createPost } from "../controller/post.controller.js"

const router = express.Router()

router.use(authenticationRequest)

router.post("/create-post",createPost)

export default router