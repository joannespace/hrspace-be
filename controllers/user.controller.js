const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Company = require("../models/Company");
const Employee = require("../models/Employee");
const User = require("../models/User");

const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const nodeMailerSending = require("../middlewares/sendEmail");
const utilsHelper = require("../helpers/utils");

const nodeMailerSecretKey = process.env.NODEMAILER_SECRETKEY;

const userControllers = {};

userControllers.signUp = catchAsync(async (req, res, next) => {
  let { name, email, password, companyName } = req.body;

  let company = await Company.findOne({ companyName });
  if (company) {
    throw new AppError(400, `Company already exists`, "Registration Error");
  }

  let user;
  if ((user = await User.findOne({ email, isDeleted: false }))) {
    throw new AppError(400, "User already exists", "Registration Error");
  }

  if ((user = await Employee.findOne({ email, isDeleted: false }))) {
    throw new AppError(
      400,
      "User existed in company employee list, please contact your company HR to activate your account",
      "Registration Error"
    );
  }

  const token = jwt.sign({ email }, nodeMailerSecretKey);

  const salt = await bcrypt.genSalt(10);
  let bcryptPass = await bcrypt.hash(password, salt);

  user = await User.create({
    name,
    email,
    password: bcryptPass,
    confirmationCode: token,
  });

  company = await Company.create({ companyName, registerPerson: user._id });

  let employee = await Employee.create({
    _id: user._id,
    name,
    email,
    password: bcryptPass,
    company: company._id,
    role: "Admin",
    lineManager: user._id,
  });

  nodeMailerSending.sendEmailVerification(
    name,
    email,
    (confirmationCode = token)
  );

  company.employees = [...company.employees, employee._id].reverse();
  await company.save();

  user.company = company._id;
  await user.save();

  sendResponse(
    res,
    200,
    true,
    "",
    null,
    "Account was created, please check your email for verification"
  );
});

userControllers.getUserList = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  let { page, limit, name, activated } = req.query;

  console.log(activated);

  page = parseInt(page) || 0;
  limit = parseInt(limit) || 10;

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    role: "Admin",
    isDeleted: false,
  });

  if (!currentUser)
    throw new AppError(
      401,
      "Invalid Role or Current User Does Not Exist",
      "Get User List Error"
    );

  let filterConditions = [{ isDeleted: false }, { company: companyId }];
  if (name) {
    filterConditions.push({
      name: { $regex: name, $options: "i" },
    });
  }

  if (activated?.length > 0) {
    filterConditions = [...filterConditions, { activated: { $in: activated } }];
  }
  console.log(filterConditions);

  const count = await User.countDocuments({ $and: filterConditions });
  const totalPages = Math.ceil(count / limit);

  let userList = await User.find({ $and: filterConditions })
    .sort({
      createdAt: -1,
    })
    .populate(["company", "generatedBy"]);
  console.log(userList);

  sendResponse(res, 200, true, { userList, totalPages, count }, null, "");
});

userControllers.activateUser = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id } = req.params;
  let { email, password } = req.body;

  const currentUser = await Employee.findOne({
    _id: userId,
    role: "Admin",
    isDeleted: false,
  });

  let employee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!employee)
    throw new AppError(
      401,
      "Employee does not exists in employee database",
      "Activate User Error"
    );

  if (employee.company.toString() !== companyId) {
    employee.company = companyId;
    await employee.save();
  }

  let newUser = await User.findOne({ _id: id, isDeleted: false });

  if (newUser)
    throw new AppError(
      401,
      "Employee existed in user database",
      "Activate User Error"
    );

  const token = jwt.sign({ email }, nodeMailerSecretKey);
  nodeMailerSending.sendPasswordAndVerification(
    employee.name,
    employee.email,
    currentUser.email,
    token,
    password
  );

  const salt = await bcrypt.genSalt(10);
  let bcryptPass = await bcrypt.hash(password, salt);

  newUser = await User.create({
    _id: id,
    name: employee.name,
    email: employee.email,
    password: bcryptPass,
    role: employee.role,
    generatedBy: userId,
    company: employee.company,
    confirmationCode: token,
  });

  employee.userGenerated = true;
  await employee.save();

  sendResponse(res, 200, true, newUser, null, "Create User Success");
});

userControllers.resetPassword = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id } = req.params;
  let { password } = req.body;

  let employee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!employee)
    throw new AppError(
      401,
      "Employee does not exists in employee database",
      "Reset User Password Error"
    );

  if (employee.company.toString() !== companyId) {
    employee.company = companyId;
    await employee.save();
  }

  let employeeUser = await User.findOne({ _id: id, isDeleted: false });

  if (!employeeUser)
    throw new AppError(
      401,
      "Employee does not exist in user database",
      "Reset User Password Error"
    );

  nodeMailerSending.sendPasswordEmail(
    employee.name,
    employee.email,
    req.body.password
  );

  const salt = await bcrypt.genSalt(10);
  let bcryptPass = await bcrypt.hash(password, salt);

  employeeUser.password = bcryptPass;
  await employeeUser.save();

  sendResponse(
    res,
    200,
    true,
    employeeUser,
    null,
    "Reset User Password Success"
  );
});

userControllers.resetPasswordViaEmail = catchAsync(async (req, res, next) => {
  let { email } = req.body;

  let user = await User.findOne({
    email,
    isDeleted: false,
  });

  let employee = await Employee.findOne({
    email,
    isDeleted: false,
  });

  if (!user || !employee)
    throw new AppError(
      401,
      "Employee does not exist",
      "Reset User Password Error"
    );

  let password = utilsHelper.generatePassword();

  if (user.activated && employee.userGenerated) {
    nodeMailerSending.sendPasswordEmail(user.name, email, password);
  } else if (!user.activated && !employeeuserGenerated) {
    const token = jwt.sign({ email }, nodeMailerSecretKey);
    nodeMailerSending.sendPasswordAndVerification(
      user.name,
      email,
      "HRSpace",
      token,
      password
    );
  }

  const salt = await bcrypt.genSalt(10);
  let bcryptPass = await bcrypt.hash(password, salt);

  user.password = bcryptPass;
  await user.save();

  employee.password = bcryptPass;
  await employee.save();

  sendResponse(res, 200, true, "", null, "Reset User Password Success");
});

userControllers.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req;
  const { id } = req.params;

  if (userId === id)
    throw new AppError(
      401,
      "Users can not delete themselves",
      "Delete User Error"
    );

  let foundEmployee = await Employee.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    { userGenerated: false }
  );

  if (!foundEmployee)
    throw new AppError(
      401,
      "Employee does not exist in user database",
      "Delete User Error"
    );

  let employeeUser = await User.findOneAndDelete({
    _id: id,
    isDeleted: false,
  });

  sendResponse(res, 200, true, "", null, "Delete User Success");
});

module.exports = userControllers;
