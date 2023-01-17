const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const config = require("../config/config");
const uploadFile = require("../middlewares/uploadFile");

/**
 * @route POST /employees/
 * @description Create an employee
 * @body {name, email, role }
 * @access Login Required, Admin Only
 */
router.post(
  "/",
  validators.validate(config.validateCreateEmployeeReq),
  authentication.loginRequired,
  authentication.adminOnly,
  employeeController.createSingleEmployee
);

/**
 * @route POST /employees/upload
 * @description Upload an employee list file
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.post(
  "/upload",
  authentication.loginRequired,
  authentication.adminOnly,
  uploadFile.upload.single("file"),
  employeeController.createManyEmployees
);

/**
 * @route GET /employees&page=0&limit=10
 * @description Get list of employees based on current employee role
 * @query {page, limit, name, department, status, employmentTypes }
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/",
  authentication.loginRequired,
  employeeController.getEmployeeList
);

/**
 * @route GET /employees/:id
 * @description See an employee information
 * @query {id}
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  employeeController.getEmployeeDetails
);

/**
 * @route PUT /employees/:id
 * @description Update an employee profile
 * @body {name, email, company,... }
 * @access Login Required, Admin Only
 */
router.put(
  "/:id",
  validators.validate(config.validateEmployeeUpdateReq),
  authentication.loginRequired,
  authentication.adminOnly,
  employeeController.updateEmployee
);

/**
 * @route DELETE /employees/:id
 * @description Delete an employee
 * @params {id }
 * @access Login Required, Admin Only
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.adminOnly,
  employeeController.deleteEmployee
);

module.exports = router;
