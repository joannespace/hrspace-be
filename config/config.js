const { body } = require("express-validator");
const validators = require("../middlewares/validators");
const config = {};

//EMPLOYEE API
config.validateCreateEmployeeReq = [
  body("name", "Invalid Name").exists().notEmpty(),
  body("email").exists().isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body("role", "Invalid Role").exists().notEmpty().isString(),
];

config.validateEmployeeUpdateReq = [
  body("name", "Invalid Name").exists().notEmpty(),
  body("password", "Invalid Password"),
  body("email", "Invalid Email")
    .exists()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  body("onboardDate", "Invalid Onboarding Date"),
  body("employmentStatus", "Invalid Employment Status"),
  body("employmentType", "Invalid Employment Type"),
  body("department", "Invalid Department"),
  body("role", "Invalid Role").exists().notEmpty().isString(),
  body("lineManager", "Invalid Line Manager").exists().notEmpty(),
  body("grossSalary", "Invalid Salary"),
  body("gender", "Invalid Gender"),
  body("birthday", "Invalid Birthday"),
  body("phone", "Invalid Phone Number"),
  body("personalEmail", "Invalid Email"),
  body("permanentAdd", "Invalid Address"),
  body("perAddCity", "Invalid City"),
  body("title", "Invalid Title").isLength({ max: 30 }),
];

config.employeeAllowsFields = [
  "name",
  "email",
  "role",
  "company",
  "password",
  "onboardDate",
  "title",
  "employmentStatus",
  "employmentType",
  "department",
  "lineManager",
  "grossSalary",
  "gender",
  "birthday",
  "phone",
  "personalEmail",
  "permanentAdd",
  "userGenerated",
  "perAddCity",
  "userGenerated",
];

config.employeeAllowedFilters = [
  "name",
  "department",
  "employmentStatus",
  "employmentType",
];

//PAPERWORK API
config.validateCreatePaperReq = [
  body("paperworkTitle", "Invalid Paperwork Title").exists(),
  body("startDate", "Invalid Contract Start Date").exists(),
  body("lastDate", "Invalid Contract Last Date").exists(),
  body("paperworkType", "Invalid Paperwork Type").exists().notEmpty(),
  body("paperworkStatus", "Invalid Paperwork Status")
    .exists()
    .notEmpty()
    .isIn(["Pending", "Generated", "Signed"]),
  body("employeeId", "Invalid Employee ID").exists().notEmpty(),
  body("reviewId", "Invalid Review ID"),
  body("templateID", "Invalid Template ID"),
  body("file", "Invalid File"),
  body("reviewGenerated", "Invalid Review"),
];

config.paperworkAllowFields = [
  "startDate",
  "lastDate",
  "paperworkType",
  "paperworkStatus",
  "employeeId",
  "reviewId",
  "templateId",
  "file",
  "content",
  "reviewGenerated",
  "paperworkTitle",
];

//REVIEW API
config.validateReviewReq = [
  body("reviewTitle", "Invalid Review Title ").exists(),
  body("reviewer", "Invalid Reviewer").custom(validators.checkObjId),
  body("reviewee", "Invalid Reviewee")
    .exists()
    .notEmpty()
    .custom(validators.checkObjId),
  body("reviewDate", "Invalid Review Date ").exists(),
  body("paperworkId", "Invalid Paperwork ID")
    .exists()
    .notEmpty()
    .custom(validators.checkObjId),
  body("attitude", "Invalid Attitude Score"),
  body("workQuality", "Invalid Work Quality Score"),
  body("reviewDecision", "Invalid Review Decision"),
  body("extendTime", "Invalid Extend Time"),
  body("improvement", "Invalid Improvement"),
];

config.reviewAllowFields = [
  "reviewer",
  "reviewee",
  "reviewDate",
  "paperworkId",
  "attitude",
  "workQuality",
  "reviewDecision",
  "extendTime",
  "improvement",
  "reviewTitle",
];

//TEMPLATE API
config.templateTypes = ["Intern", "Probation", "Part-time", "Full-time"];

config.templateValidationReq = [
  body("templateName", "Invalid Template Name").exists().notEmpty().isString(),
  body("content", "Invalid Content").exists().notEmpty().isString(),
  body("category", "Invalid Category")
    .exists()
    .notEmpty()
    .isIn(config.templateTypes),
  body("company", "Invalid Company")
    .exists()
    .notEmpty()
    .custom(validators.checkObjId),
  body("creator", "Invalid Creator")
    .exists()
    .notEmpty()
    .custom(validators.checkObjId),
  body("company", "Invalid Company")
    .exists()
    .notEmpty()
    .custom(validators.checkObjId),
];

config.templateAllowFields = [
  "templateName",
  "content",
  "category",
  "creator",
  "company",
  "fieldForms",
];

config.templateAllowFilters = ["templateName", "creator", "category"];

//USER API
config.validateUserReq = [
  body("name", "Invalid Name").exists().notEmpty(),
  body("email", "Invalid Email")
    .exists()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password", "Invalid Password").exists().notEmpty(),
  body("companyName", "Invalid Company Name").exists().notEmpty(),
];

module.exports = config;
