import express from "express"
import { login, logout, refreshTokenUser, registerUser } from "../controller/identity.controller.js"

const router = express.Router()

router.post("/register",registerUser)

router.post("/login",login)

router.post("refresh-token", refreshTokenUser)

router.post("/logout",logout)



export default router