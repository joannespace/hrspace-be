const express = require("express");
const { body } = require("express-validator");
const authControllers = require("../controllers/auth.controller");
const validators = require("../middlewares/validators");
const router = express.Router();

/**
 * @route POST /auth/login
 * @description Login with username and password
 * @body {email, passsword}
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid Email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid Password").exists().notEmpty(),
  ]),
  authControllers.loginWithEmail
);

/**
 * @route POST /auth/loginWithGmail
 * @description Login with Gmail
 * @body {email, email_verified}
 * @access Public
 */
router.post(
  "/loginWithGmail",
  validators.validate([
    body("email", "Invalid Email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
  ]),
  authControllers.loginWithGmail
);

/**
 * @route POST /auth/verification/:confirmationCode
 * @description Verify email
 * @body {confirmationCode}
 * @access Private
 */
router.post("/verification/:confirmationCode", authControllers.verifyEmail);

module.exports = router;
