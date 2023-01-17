require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const { sendResponse } = require("./helpers/utils");
const mongoose = require("mongoose");

const mongoDB = process.env.MONGODB_URI;

mongoose
  .connect(mongoDB)
  .then(() => console.log(`Success Connection to ${mongoDB}`))
  .catch((error) => console.log(error));

app.use("/", indexRouter);

//Handle 404
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.statusCode = 404;
  next(error);
});

//Error-handling middleware
app.use((err, req, res, next) => {
  console.log("ERROR", err);

  if (err.isOperational) {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      err.errorType
    );
  } else {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      "Internal Server Error"
    );
  }
});

module.exports = app;
