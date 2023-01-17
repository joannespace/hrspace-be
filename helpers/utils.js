const { format } = require("date-fns");
const csv = require("csvtojson");

const utilsHelper = {};

const csvFields = [
  "name",
  "email",
  "role",
  "company",
  // "password",
  "onboardDate",
  "title",
  "employmentStatus",
  "employmentType",
  "department",
  // "lineManager",
  "grossSalary",
  // "paperwork",
  // "review",
  "gender",
  "birthday",
  "phone",
  "personalEmail",
  "permanentAdd",
  "userGenerated",
  "perAddCity",
];

utilsHelper.sendResponse = (res, status, success, data, errors, message) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;

  return res.status(status).json(response);
};

class AppError extends Error {
  constructor(statusCode, message, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true; // track if errors are tracked with this class

    Error.captureStackTrace(this, this.contructor);
  }
}
utilsHelper.AppError = AppError;

utilsHelper.catchAsync = (func) => (req, res, next) => {
  func(req, res, next).catch((error) => next(error));
};

utilsHelper.formatDate = (dateIOS) => {
  return format(new Date(dateIOS), "yyyy-MM-dd");
};

utilsHelper.createEmployeeFromCSV = async (filePath) => {
  try {
    let transfromCSV = await csv().fromFile(
      `/Users/joanne/Documents/hrspace-be/${filePath}`
    );

    //Check if email duplicated
    for (let i = 1; i < transfromCSV.length; i++) {
      let employeeEmail = transfromCSV[0].email;
      let currentEmployee = transfromCSV[i];
      if (currentEmployee.email === employeeEmail) {
        throw new AppError(400, "Duplicated Emails In Uploaded File");
      }
    }

    //Check if name, email, role exists
    transfromCSV.forEach((employee) => {
      if (!employee.name || !employee.email || !employee.role)
        throw new AppError(
          400,
          "Missing Compulsory Fields (name, email, role) In Uploaded File"
        );
    });

    transfromCSV = transfromCSV.map((employee) => {
      let newPerson = {};
      csvFields.forEach((field) => {
        if (employee[field]) {
          if (field === "onboardDate" || field === "birthday") {
            return (newPerson = Object.assign(newPerson, {
              [field]: new Date(employee[field]),
            }));
          } else if (field === "grossSalary") {
            return (newPerson = Object.assign(newPerson, {
              [field]: Number(employee[field]),
            }));
          } else {
            return (newPerson = Object.assign(newPerson, {
              [field]: employee[field],
            }));
          }
        }
      });

      return newPerson;
    });

    return transfromCSV;
  } catch (error) {
    console.log(error);
    throw new AppError(
      400,
      "Internal Server Error",
      "Create Employee Data From CSV"
    );
  }
};

utilsHelper.generatePassword = () => {
  let length = 6,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    password = "";

  for (let i = 0, n = charset.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }

  return password;
};
module.exports = utilsHelper;
