import User from "../model/user.model.js";
import { generateToken } from "../util/generateToken.js";
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

  const { accessToken, refreshToken } = await generateToken(user);

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

  const user = await User.findOne({email})

  if(!user){
    logger.warn("User does not exist", error?.details[0]?.message);
    return res
      .status(404)
      .json({ success: false, message: "user not exists" });
  }
});
