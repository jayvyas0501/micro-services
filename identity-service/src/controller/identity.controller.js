import { RefreshToken } from "../model/refreshToken.model.js";
import User from "../model/user.model.js";
import { generateTokens } from "../util/generateToken.js";
import logger from "../util/logger.js";
import { validationRegister, validationlogin } from "../util/validation.js";
import { wrapAsync } from "../util/wrapAsync.js";

export const registerUser = wrapAsync(async (req, res) => {
  logger.info("Register endpoint hit");
  const { error } = validationRegister(req.body);
  if (error) {
    logger.warn("Validation error :", error.details[0].message);
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { email, username, password } = req.body;

  let user = await User.findOne({ $or: [{ email }, { username }] });

  if (user) {
    logger.warn("User already exist", error?.details[0]?.message);
    return res
      .status(400)
      .json({ success: false, message: "user already exists" });
  }
  user = new User({ username, email, password });
  await user.save();

  logger.warn("user register successfully!", user._id);

  const { accessToken, refreshToken } = await generateTokens(user);

  res.status(201).json({
    success: true,
    message: "User register successfully!",
    accessToken,
    refreshToken,
  });
});

export const login = wrapAsync(async (req, res) => {
  logger.info("login endpoint hit...");
  const { error } = validationlogin(req.body);
  if (error) {
    logger.warn("Validation error :", error.details[0].message);
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn("User does not exist", error?.details[0]?.message);
    return res
      .status(400)
      .json({ success: false, message: "user does not exists" });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    logger.warn("Invalid Password!", error?.details[0]?.message);
    return res
      .status(400)
      .json({ success: false, message: "Invalid Password!" });
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  res.json({
    accessToken,
    refreshToken,
    userId: user._id,
  });
});

export const refreshTokenUser = wrapAsync(async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      message: "refresh token not found",
      success: false,
    });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    logger.warn("Invalid or expired refresh token!");
    res.status(401).json({
      message: "Invalid or expired refresh token!",
      success: false,
    });
  }

  const user = await User.findOne(storedToken.user);

  if (!user) {
    logger.warn("User not found");
    res.status(401).json({
      message: "User not found",
      success: false,
    });
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateTokens(user);

  await RefreshToken.deleteOne({ _id: storedToken._id });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const logout = wrapAsync(async (req,res) => {
    logger.info('logout endpoint hit...')

    const {refreshToken} = req.body
    if(!refreshToken){
      logger.warn("Refresh token is missing!")
      return res.status(400).json({
        success:false,
        message: "Refresh token is missing!"
    })
  }
  await RefreshToken.deleteOne({token:refreshToken})

  res.json({
    success:true,
    message:"User logged out!"
  })
})