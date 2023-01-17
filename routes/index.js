var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Welcome to HRSpace Backend Server");
});

const userRouter = require("./user.api");
router.use("/users", userRouter);

const employeeRouter = require("./employee.api");
router.use("/employees", employeeRouter);

const paperworkRouter = require("./paperwork.api");
router.use("/paperwork", paperworkRouter);

const reviewRouter = require("./review.api");
router.use("/reviews", reviewRouter);

const authRouter = require("./auth.api");
router.use("/auth", authRouter);

const templateRouter = require("./template.api");
router.use("/templates", templateRouter);

module.exports = router;
