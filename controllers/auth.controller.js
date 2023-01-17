const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");

const { catchAsync, AppError, sendResponse } = require("../helpers/utils");

const authControllers = {};

authControllers.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne(
    { email, activated: true, isDeleted: false },
    "+password"
  ).populate("company");

  if (!user) throw new AppError(400, "Invalid Credentials", "Login Error");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong Password", "Login Error");

  const accessToken = await user.generateToken();

  sendResponse(res, 200, true, { user, accessToken }, null, "Login Success");
});

authControllers.loginWithGmail = catchAsync(async (req, res, next) => {
  const { email, email_verified } = req.body;

  if (!email_verified)
    throw new AppError(400, "Unverified Email", "Login Error");

  const criteria = { email, activated: true, isDeleted: false };
  const user = await User.findOne(criteria).populate("company");
  if (!user) {
    throw new AppError(
      400,
      "Invalid Credentials. Please register your account",
      "Login Error"
    );
  }

  const accessToken = await user.generateToken();

  sendResponse(res, 200, true, { user, accessToken }, null, "Login Success");
});

authControllers.verifyEmail = catchAsync(async (req, res, next) => {
  const { confirmationCode } = req.params;

  const { email } = jwt.decode(confirmationCode);

  const user = await User.findOne({
    email,
    confirmationCode,
    activated: false,
    isDeleted: false,
  }).populate("company");

  if (!user)
    throw new AppError(400, "Unregistered Email", "Verification Error");

  user.activated = true;
  await user.save();

  const employee = await Employee.findOne({
    _id: user._id,
    isDeleted: false,
  });

  employee.userGenerated = true;

  await employee.save();

  const accessToken = await user.generateToken();

  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Email Verification Success"
  );
});

module.exports = authControllers;
