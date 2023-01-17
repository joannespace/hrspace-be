const { mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");
const Company = require("../models/Company");
const Paperwork = require("../models/Paperwork");

const {
  catchAsync,
  sendResponse,
  AppError,
  createEmployeeFromCSV,
} = require("../helpers/utils");
const {
  employeeAllowsFields,
  employeeAllowedFilters,
} = require("../config/config");
const nodeMailerSending = require("../middlewares/sendEmail");
const utilsHelper = require("../helpers/utils");

const nodeMailerSecretKey = process.env.NODEMAILER_SECRETKEY;

const employeeController = {};

employeeController.createSingleEmployee = catchAsync(async (req, res, next) => {
  //Get info
  const { userId, companyId } = req;
  let { email } = req.body;

  //Check employee exists?
  let newEmployee = await Employee.findOne({
    email,
    company: companyId,
    isDeleted: false,
  });

  if (newEmployee) {
    throw new AppError(
      400,
      "Employee already exists or duplicated email",
      "Create Employee Error"
    );
  }

  //Create employee creation criteria
  let criteria = {};

  employeeAllowsFields.forEach((field) => {
    if (req.body[field]) {
      criteria[field] = req.body[field];
    }
  });

  criteria.company = mongoose.Types.ObjectId(companyId);

  //Create employee
  newEmployee = await Employee.create(criteria);

  //Add employee to Company Collection
  const employeesCompany = await Company.findOne({
    _id: newEmployee.company,
    isDeleted: false,
  });

  if (!employeesCompany) {
    newEmployee = await Employee.findByIdAndDelete(newEmployee._id);
    throw new AppError(400, "Company does not exits", "Create Employee Error");
  } else {
    employeesCompany.employees = employeesCompany.employees.concat(
      newEmployee._id
    );

    await employeesCompany.save();
  }

  //Create new user & bcrypt password in newEmployee and newUser
  const salt = await bcrypt.genSalt(10);
  const userCriteria = {
    _id: newEmployee._id,
    name: newEmployee.name,
    email: newEmployee.email,
    company: newEmployee.company,
    role: newEmployee.role,
    generatedBy: userId,
  };

  if (newEmployee.password) {
    userCriteria.password = newEmployee.password;
    newEmployee.password = await bcrypt.hash(newEmployee.password, salt);
    await newEmployee.save();
  } else {
    userCriteria.password = utilsHelper.generatePassword();
  }

  const newUser = await User.create(userCriteria);

  const token = await jwt.sign({ email: newUser.email }, nodeMailerSecretKey);

  const currentUser = await User.findOne({ _id: userId, isDeleted: false });
  nodeMailerSending.sendPasswordAndVerification(
    newUser.name,
    newUser.email,
    currentUser.email,
    token,
    userCriteria.password
  );

  newUser.password = await bcrypt.hash(criteria.password, salt);
  newUser.confirmationCode = token;
  await newUser.save();

  //Send response
  sendResponse(
    res,
    200,
    true,
    { newEmployee },
    null,
    "Create Employee Success"
  );
});

employeeController.createManyEmployees = catchAsync(async (req, res, next) => {
  //Get data
  const { file, companyId, userId } = req;

  //Convert CSV file to array
  const employeeArray = await createEmployeeFromCSV((filePath = file.path));

  //Run loop to create employee and user
  for (let i = 0; i < employeeArray.length; i++) {
    let employee = employeeArray[i];
    let newEmployee = await Employee.findOne({
      email: employee.email,
      company: companyId,
      isDeleted: false,
    });

    if (newEmployee)
      throw new AppError(
        401,
        `Duplicated Employee's Email: ${employee.email}`,
        "Create Employee Error"
      );

    let criteria = {};

    employeeAllowsFields.forEach((field) => {
      if (employee[field]) {
        criteria[field] = employee[field];
      }
    });

    criteria.company = mongoose.Types.ObjectId(companyId);
    criteria.lineManager
      ? criteria.lineManager
      : (criteria.lineManager = userId);

    newEmployee = await Employee.create(criteria);

    const employeesCompany = await Company.findOne({
      _id: newEmployee.company,
      isDeleted: false,
    });

    if (!employeesCompany) {
      newEmployee = await Employee.findByIdAndDelete(newEmployee._id);
      throw new AppError(
        400,
        "Company does not exits",
        "Create Employee Data Error"
      );
    } else {
      employeesCompany.employees = employeesCompany.employees.concat(
        newEmployee._id
      );

      await employeesCompany.save();
    }

    //Create new user & bcrypt password in newEmployee and newUser
    const salt = await bcrypt.genSalt(10);

    const userCriteria = {
      _id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      company: newEmployee.company,
      role: newEmployee.role,
      generatedBy: userId,
    };

    let userPassword;
    if (newEmployee.password) {
      userPassword = newEmployee.password;

      newEmployee.password = await bcrypt.hash(newEmployee.password, salt);
      await newEmployee.save();

      userCriteria.password = userPassword;
    } else {
      userPassword = userCriteria.password = utilsHelper.generatePassword();
    }

    const newUser = await User.create(userCriteria);

    const token = await jwt.sign({ email: newUser.email }, nodeMailerSecretKey);

    newUser.password = await bcrypt.hash(userPassword, salt);
    newUser.confirmationCode = token;
    await newUser.save();

    const currentUser = await User.findOne({ _id: userId, isDeleted: false });

    nodeMailerSending.sendPasswordAndVerification(
      newUser.name,
      newUser.email,
      currentUser.email,
      token,
      userPassword
    );
  }

  //Send response
  sendResponse(res, 200, true, "", null, "Create Employee Data Success");
});

employeeController.getEmployeeList = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  let { page, limit, ...filter } = req.query;
  page = parseInt(page) || 0;
  limit = parseInt(limit) || 10;

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  }).populate("company");

  if (!currentUser)
    throw new AppError(
      401,
      "Current Logged-in User Invalid",
      "Get Employee list Invalid"
    );

  let filterConditions = [{ isDeleted: false }, { company: companyId }];

  switch (currentUser.role) {
    case "Admin":
      employeeAllowedFilters.forEach((query) => {
        if (filter[query]) {
          if (query === "name") {
            filterConditions.push({
              name: { $regex: filter[query], $options: "i" },
            });
          } else {
            filterConditions = [
              ...filterConditions,
              { [query]: { $in: filter[query] } },
            ];
          }
        }
      });
      break;

    case "Employee":
      filterConditions = filterConditions.concat({ _id: userId });
      break;

    case "Manager":
      employeeAllowedFilters.forEach((query) => {
        if (filter[query]) {
          if (query === "name") {
            filterConditions = filterConditions.concat({
              name: { $regex: filter[query], $options: "i" },
            });
          } else if (query === "department") {
            if (filter.department === currentUser.department) {
              filterConditions = filterConditions.concat({
                department: currentUser.department,
              });
            } else {
              throw new AppError(
                400,
                "Invalid Department",
                "Get Employee List Error"
              );
            }
          } else {
            filterConditions = [
              ...filterConditions,
              { [query]: { $in: filter[query] } },
            ];
          }
        }
      });
      filterConditions = filterConditions.concat({
        $or: [{ _id: userId }, { lineManager: userId }],
      });
      break;
  }

  const count = await Employee.countDocuments({ $and: filterConditions });
  const totalPages = Math.ceil(count / limit);

  let employeeList = await Employee.find({ $and: filterConditions })
    .sort({
      createdAt: -1,
    })
    .populate(["company", "lineManager", "paperwork"]);

  sendResponse(
    res,
    200,
    true,
    { user: currentUser, employeeList, totalPages, count },
    null,
    "Get Employee List Success"
  );
});

employeeController.getEmployeeDetails = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id } = req.params;

  let filterConditions = [
    { _id: id },
    { company: companyId },
    { isDeleted: false },
  ];

  let foundEmployee = await Employee.findOne({
    $and: filterConditions,
  }).populate(["lineManager", "company", "paperwork", "review"]);

  if (!foundEmployee) {
    throw new AppError(400, "No Employee Found", "Get Employee Details Error");
  }

  const currentUser = await Employee.findOne({ _id: userId, isDeleted: false });

  switch (currentUser.role) {
    case "Admin":
      foundEmployee;
      break;

    case "Employee":
      if (foundEmployee._id.toString() === userId) {
        foundEmployee;
      } else {
        throw new AppError(400, "Invalid Role", "Get Employee Details Error");
      }
      break;

    case "Manager":
      if (foundEmployee.lineManager?._id.toString() === userId) {
        foundEmployee;
      } else if (foundEmployee._id.toString() === userId) {
        foundEmployee;
      } else {
        throw new AppError(
          400,
          "Invalid Role, please update Line Manager",
          "Get Employee Details Error"
        );
      }
      break;
  }

  sendResponse(
    res,
    200,
    true,
    foundEmployee,
    null,
    "Get Employee Detail Success"
  );
});

employeeController.updateEmployee = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id } = req.params;
  let { password, ...otherUpdates } = req.body;
  const originalPassword = req.body.password;

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  let filterConditions = [
    { _id: id },
    { company: companyId },
    { isDeleted: false },
  ];

  let foundEmployee = await Employee.findOne({ $and: filterConditions });

  if (!foundEmployee) {
    throw new AppError(400, "Employee does not exist", "Update Employee Error");
  }

  let updateKeys = Object.keys(otherUpdates);

  employeeAllowsFields.forEach((key) => {
    if (key !== "password" && key !== "role") {
      if (updateKeys.includes(key)) {
        if (otherUpdates[key]) {
          foundEmployee[key] = otherUpdates[key];
        } else {
          foundEmployee[key] = undefined;
        }
      } else {
        foundEmployee[key] = undefined;
      }
    }
  });

  await foundEmployee.save();

  //Check current user is first admin >> Can not update role
  const foundUser = await User.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  });

  if (otherUpdates.role !== foundEmployee.role) {
    //Check if master admin
    if (userId === id && foundUser.generatedBy === undefined) {
      throw new AppError(
        400,
        "Master Admin can not adjust role",
        "Update Employee Error"
      );
    } else {
      foundEmployee.role = otherUpdates.role;
      await foundEmployee.save();

      foundUser.role = otherUpdates.role;
      await foundUser.save();
    }
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    if (foundEmployee.password) {
      const isMatch = await bcrypt.compare(
        bcryptPassword,
        foundEmployee.password
      );

      if (!isMatch) {
        nodeMailerSending.sendPasswordEmail(
          foundEmployee.name,
          foundEmployee.email,
          originalPassword
        );

        foundEmployee.password = bcryptPassword;
        await foundEmployee.save();
      }
    } else {
      const token = await jwt.sign(
        { email: foundEmployee.email },
        nodeMailerSecretKey
      );
      if (foundEmployee.userGenerated) {
        nodeMailerSending.sendPasswordEmail(
          foundEmployee.name,
          foundEmployee.email,
          originalPassword
        );
      } else {
        nodeMailerSending.sendPasswordAndVerification(
          foundEmployee.name,
          foundEmployee.email,
          currentUser.email,
          token,
          req.body.password
        );
      }
      foundEmployee.password = bcryptPassword;
      await foundEmployee.save();
    }
  }

  await foundEmployee.populate(["company", "paperwork"]);

  sendResponse(
    res,
    200,
    true,
    "foundEmployee",
    null,
    "Update Employee Success"
  );
});

employeeController.deleteEmployee = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id } = req.params;

  //Remove employeeID from Company
  let employeesCompany = await Company.findOne({
    _id: companyId,
    employees: { $elemMatch: { $eq: id } },
    isDeleted: false,
  });

  if (!employeesCompany) {
    throw new AppError(
      400,
      "Employee does not exist in Company",
      "Delete Employee Error"
    );
  } else {
    let employeeIndex = employeesCompany.employees.findIndex(
      (employee) => employee.toString() === id
    );

    employeesCompany.employees.splice(employeeIndex, 1);

    await employeesCompany.save();
  }

  let employeesPaperwork = await Paperwork.find({
    employeeId: id,
    isDeleted: false,
  });

  let savePromises;

  if (employeesPaperwork.length !== 0) {
    savePromises = employeesPaperwork.map(async (paperwork) => {
      paperwork.isDeleted = true;
      await paperwork.save();
    });

    Promise.all(savePromises);
  }

  //Update isDeleted in Employee
  let foundEmployee = await Employee.findOneAndUpdate(
    {
      _id: id,
      company: companyId,
      isDeleted: false,
    },
    { isDeleted: true, userGenerated: false }
  );

  if (!foundEmployee) {
    throw new AppError(400, "Invalid Employee", "Delete Employees Error");
  }

  //Delete user (soft)
  const foundUser = await User.findOne({ _id: id, isDeleted: false });
  foundUser.activated = false;
  foundUser.confirmationCode = undefined;
  foundUser.password = undefined;
  foundUser.isDeleted = true;
  await foundUser.save();

  //Send response
  sendResponse(res, 200, true, "", null, "Delete Employee Success");
});

module.exports = employeeController;
