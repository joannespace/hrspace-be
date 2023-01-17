const { mongoose } = require("mongoose");

const Employee = require("../models/Employee");
const Paperwork = require("../models/Paperwork");
const Review = require("../models/Review");

const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const { paperworkAllowFields } = require("../config/config");

const paperworkController = {};

paperworkController.getPaperworkList = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id } = req.params; //ID Employee
  let { page, limit, type } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  // if (type !== "review") {
  //   if (currentUser.role !== "Admin") {
  //     if (userId !== id) {
  //       throw new AppError(400, "Invalid Role", "Get Paperwork List Error");
  //     }
  //   }
  // }

  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  });
  if (!foundEmployee) {
    throw new AppError(
      400,
      "Employee does not exist",
      "Get Paperwork List Error"
    );
  }

  const count = await Paperwork.countDocuments({
    employeeId: id,
    isDeleted: false,
  });

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  let paperworkList = await Paperwork.find({ employeeId: id, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate(["employeeId", "reviewId", "templateId"]);

  sendResponse(res, 200, true, { paperworkList, totalPages, count }, null, "");
});

paperworkController.getSinglePaperwork = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id, idPaper } = req.params;

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  if (currentUser.role !== "Admin") {
    if (userId !== id) {
      throw new AppError(400, "Invalid Role", "Get Paperwork List Error");
    }
  }

  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
    paperwork: { $elemMatch: { $eq: mongoose.Types.ObjectId(idPaper) } },
  });

  if (!foundEmployee) {
    throw new AppError(
      400,
      "Employee does not exist",
      "Get Single Paperwork Error"
    );
  }

  let foundPaperwork = await Paperwork.findOne({
    _id: idPaper,
    isDeleted: false,
  }).populate(["employeeId", "templateId"]);

  if (!foundPaperwork) {
    throw new AppError(400, "No paperwork found", "Get Single Paperwork Error");
  }

  sendResponse(
    res,
    200,
    true,
    foundPaperwork,
    null,
    "Get Single Paperwork Success"
  );
});

paperworkController.createPaperwork = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { startDate, lastDate, paperworkType, reviewGenerated } = req.body;
  const { id } = req.params;

  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  }).populate("paperwork");

  if (foundEmployee.paperwork.length > 0) {
    foundEmployee.paperwork.forEach((paper) => {
      if (
        paper.startDate.toISOString() === startDate &&
        paper.lastDate.toISOString() === lastDate &&
        paper.paperworkType === paperworkType
      ) {
        throw new AppError(
          400,
          "Paperwork already exists",
          "Create Paperwork Error"
        );
      }
    });
  }

  let criteria = {};
  // let bodyKeys = Object.keys(req.body);
  // let invalidKeys = [];

  // bodyKeys.forEach((key) => {
  //   if (!paperworkAllowFields.includes(key)) {
  //     invalidKeys = key === "file" ? invalidKeys : [...invalidKeys, key]; //Adjusted
  //   }
  // });

  // if (invalidKeys.length > 0)
  //   throw new AppError(401, "Invalid Field Input", "Create Employee Error");

  paperworkAllowFields.forEach((field) => {
    if (req.body[field]) {
      criteria[field] = req.body[field];
    }
  });

  let newPaperwork = await Paperwork.create(criteria);

  await newPaperwork.populate("employeeId");

  if (reviewGenerated) {
    const reviewCriteria = {
      reviewTitle: `Review for ${newPaperwork.employeeId.name}'s ${newPaperwork.paperworkTitle}`,
      reviewer: newPaperwork.employeeId.lineManager
        ? newPaperwork.employeeId.lineManager
        : undefined,
      reviewee: newPaperwork.employeeId._id,
      reviewDate: newPaperwork.lastDate,
      reviewDecision: "Pending",
      paperworkId: newPaperwork._id,
    };

    const newReview = await Review.create(reviewCriteria);
    newPaperwork.reviewId = newReview._id;
    await newPaperwork.save();

    foundEmployee.review = [...foundEmployee.review, newReview._id].reverse();
    await foundEmployee.save();
  }

  foundEmployee.paperwork = [
    ...foundEmployee.paperwork,
    newPaperwork._id,
  ].reverse();

  await foundEmployee.save();

  sendResponse(res, 200, true, newPaperwork, null, "Paperwork Created Success");
});

paperworkController.updatePaperwork = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id, idPaper } = req.params;

  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    paperwork: { $elemMatch: { $eq: mongoose.Types.ObjectId(idPaper) } },
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(
      400,
      "Employee does not exist",
      "Update Paperwork Error"
    );
  }

  let foundPaperwork = await Paperwork.findOne({
    _id: idPaper,
    isDeleted: false,
  });

  if (!foundPaperwork) {
    throw new AppError(400, "No paperwork found", "Update Paperwork Error");
  }

  let updateKeys = Object.keys(req.body);
  let invalidKeys = [];

  updateKeys.forEach((key) => {
    if (!paperworkAllowFields.includes(key)) {
      key === "_id" ? invalidKeys : (invalidKeys = [...invalidKeys, key]);
    }
  });

  if (invalidKeys.length > 0)
    throw new AppError(401, "Invalid Field Input", "Update Paperwork Error");

  paperworkAllowFields.forEach((key) => {
    if (updateKeys.includes(key)) {
      if (req.body[key]) {
        return (foundPaperwork[key] = req.body[key]);
      } else {
        return (foundPaperwork[key] = undefined);
      }
    } else {
      return (foundPaperwork[key] = undefined);
    }
  });

  await foundPaperwork.save();

  sendResponse(
    res,
    200,
    true,
    foundPaperwork,
    null,
    "Update Paperwork Success"
  );
});

paperworkController.deletePaperwork = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id, idPaper } = req.params;

  //Update isDeleted in Paperwork
  let foundPaperwork = await Paperwork.findOneAndUpdate(
    {
      _id: idPaper,
      employeeId: id,
      isDeleted: false,
    },
    { isDeleted: true }
  );

  if (!foundPaperwork) {
    throw new AppError(
      400,
      "Paperwork does not exist",
      "Delete Paperwork Error"
    );
  }

  //Update isDeleted in Review
  let foundReview = await Review.findOneAndDelete({
    paperworkId: idPaper,
    isDeleted: false,
  });

  if (!foundReview) {
    throw new AppError(400, "Review does not exist", "Delete Paperwork Error");
  }

  //Update from Employee
  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  });

  if (foundEmployee) {
    //Remove paperworkID
    let paperworkIndex = foundEmployee.paperwork.findIndex(
      (paper) => paper.toString() === idPaper
    );
    foundEmployee.paperwork.splice(paperworkIndex, 1);

    //Remove reviewID
    let reviewIndex = foundEmployee.review.findIndex(
      (review) => review.toString() === foundReview._id
    );
    foundEmployee.review.splice(reviewIndex, 1);

    //Save Employee
    await foundEmployee.save();
  }

  sendResponse(res, 200, true, "", null, "Delete Paperwork Success");
});

module.exports = paperworkController;
