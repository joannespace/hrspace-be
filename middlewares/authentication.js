const jwt = require("jsonwebtoken");

const Employee = require("../models/Employee");
const { AppError } = require("../helpers/utils");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!authentication)
      throw new AppError(401, "Login Required", "Authenication Error");

    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(401, "Token Expired", "Authenication Error");
        } else {
          throw new AppError(401, "Token is invalid", "Authenication Error");
        }
      }
      req.userId = payload._id;
      req.companyId = payload._idCompany;
    });

    next();
  } catch (error) {
    next(error);
  }
};

authentication.adminOnly = async (req, res, next) => {
  try {
    const { userId, companyId } = req;

    const currentUser = await Employee.findOne({
      _id: userId,
      company: companyId,
      isDeleted: false,
    });

    if (currentUser.role !== "Admin") {
      throw new AppError(
        "400",
        "Only admin can access",
        "Authentication Error"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
