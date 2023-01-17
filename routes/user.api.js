const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const router = express.Router();
const config = require("../config/config");

/**
 * @route POST /users/register
 * @description Register a new user
 * @body {name, email, password}
 * @access Public
 */
router.post(
  "/register",
  validators.validate(config.validateUserReq),
  userController.signUp
);

/**
 * @route GET /users
 * @description Get user list
 * @body {page, limit, searchName, filter}
 * @access Login Required, Admin Only
 */
router.get(
  "/",
  authentication.loginRequired,
  authentication.adminOnly,
  userController.getUserList
);

/**
 * @route POST /users/activate
 * @description Activate a user
 * @body {email, password}
 * @params {id}
 * @access Login Required, Admin Only
 */
router.post(
  "/activate/:id",
  validators.validate([
    body("password", "Invalid Password").exists().notEmpty(),
  ]),
  authentication.loginRequired,
  authentication.adminOnly,
  userController.activateUser
);

/**
 * @route PUT /users/reset
 * @description Reset password
 * @body {email, password}
 * @params {id}
 * @access Login Required, Admin Only
 */
router.put(
  "/reset/:id",
  authentication.loginRequired,
  authentication.adminOnly,
  userController.resetPassword
);

/**
 * @route PUT /users/forgetpassword
 * @description Reset password via email
 * @body {email, password}
 * @params {id}
 * @access Public
 */
router.put("/forgetpassword", userController.resetPasswordViaEmail);

/**
 * @route DELETE /users
 * @description Reset password
 * @params {id}
 * @access Login Required, Admin Only
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.adminOnly,
  userController.deleteUser
);

module.exports = router;
