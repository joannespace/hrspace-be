const Employee = require("../models/Employee");
const Paperwork = require("../models/Paperwork");
const Review = require("../models/Review");

const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const { reviewAllowFields } = require("../config/config");

const nodeMailerSending = require("../middlewares/sendEmail");
const { mongoose } = require("mongoose");

const reviewController = {};

reviewController.createReview = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id } = req.params;
  const { reviewer, reviewee, paperworkId, reviewDate } = req.body;

  let foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    paperwork: { $elemMatch: { $eq: paperworkId } },
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(
      400,
      "No User Found or Paperwork does not exist",
      "Create Review Error"
    );
  }

  if (reviewee !== id) {
    throw new AppError(400, "Invalid Reviewee", "Create Review Error");
  }

  let foundPaper = await Paperwork.findOne({
    _id: paperworkId,
    isDeleted: false,
  });

  if (!foundPaper) {
    throw new AppError(400, "No Paperwork Found", "Create Review Error");
  }

  let foundReview = await Review.findOne({
    $and: [{ reviewer, reviewee, paperworkId }],
  });

  if (foundReview) {
    throw new AppError(400, "Review already exists", "Create Review Error");
  }

  let { startDate, endDate } = foundPaper;

  if (Date.parse(reviewDate) < Date.parse(startDate)) {
    throw new AppError(
      400,
      "Review Date must be after Paperwork Start Date",
      "Create Review Error"
    );
  }

  if (Date.parse(reviewDate) > Date.parse(endDate)) {
    throw new AppError(
      400,
      "Review Date must be preceeding Paperwork End Date",
      "Create Review Error"
    );
  }

  let criteria = {};
  reviewAllowFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      criteria = Object.assign(criteria, { [field]: req.body[field] });
    } else {
      if (field === "reviewDecision") {
        criteria = Object.assign(criteria, { reviewDecision: "Pending" });
      }
    }
  });

  let newReview = await Review.create(criteria);

  foundEmployee.review = [...foundEmployee.review, newReview._id];
  if (!foundEmployee.lineManager) {
    foundEmployee.lineManager = req.body.reviewer;
  }
  await foundEmployee.save();

  foundPaper = await Paperwork.findOneAndUpdate(
    {
      _id: paperworkId,
      isDeleted: false,
    },
    { reviewId: newReview._id }
  );

  if (!foundPaper) {
    //Delete created review
    await Review.findByIdAndDelete(newReview._id);

    //Delete review from employee's review list
    let reviewIndex = foundEmployee.review.findIndex(
      (review) => review.toString() === newReview._id.toString()
    );
    foundEmployee.review.splice(reviewIndex, 1);
    await foundEmployee.save();

    throw new AppError(400, "No Paperwork Found", "Create Review Error");
  }

  sendResponse(res, 200, true, newReview, null, "Create Review Success");
});

reviewController.getReviewList = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id } = req.params;
  let { page, limit, reviewDecision, reviewTitle } = req.query;
  page = parseInt(page) || 0;
  limit = parseInt(limit) || 10;

  const foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(400, "No Employee Found", "Get Review List Error");
  }

  const currentUser = await Employee.findOne({
    _id: userId,
    isDeleted: false,
  });

  let filterConditions = [{ isDeleted: false }, { reviewee: id }];

  if (reviewDecision) {
    filterConditions = [...filterConditions, { reviewDecision }];
  }

  if (reviewTitle) {
    filterConditions.push({
      reviewTitle: { $regex: reviewTitle, $options: "i" },
    });
  }

  switch (currentUser.role) {
    case "Admin":
      filterConditions;
      break;

    case "Manager":
      filterConditions = [...filterConditions, { reviewer: userId }];
      break;

    case "Employee":
      if (currentUser._id.toString() === id) {
        filterConditions = [...filterConditions, { reviewee: userId }];
      } else {
        throw new AppError(400, "Invalid Role", "Get Review List Error");
      }
      break;
  }

  const count = await Review.countDocuments({ $and: filterConditions });
  const totalPages = Math.ceil(count / limit);

  const reviewList = await Review.find({ $and: filterConditions })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate(["reviewer", "reviewee", "paperworkId"]);

  sendResponse(res, 200, true, { reviewList, totalPages, count }, null, "");
});

reviewController.getSingleReview = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id, reviewId } = req.params;

  const foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    review: { $elemMatch: { $eq: reviewId } },
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(
      400,
      "No Employee Found or Review does not exist",
      "Get Review Error"
    );
  }

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  let filterConditions = [
    { _id: reviewId },
    { idDeleted: false },
    { reviewee: id },
  ];

  switch (currentUser.role) {
    case "Admin":
      filterConditions;
      break;

    case "Manager":
      if (foundEmployee.lineManager.toString() === userId) {
        filterConditions = [...filterConditions, { reviewer: userId }];
      } else {
        throw new AppError(
          400,
          "Only Manager Of Employee Can Access",
          "Get Review Error"
        );
      }
      break;

    case "Employee":
      if (userId === id) {
        filterConditions;
      } else {
        throw new AppError(400, "Invalid Role", "Get Review Error");
      }
      break;
  }

  let foundReview = await Review.findOne({ $and: filterConditions });

  sendResponse(res, 200, true, foundReview, null, "Get Review Success");
});

reviewController.updateReview = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { id, reviewId } = req.params;
  let update = req.body;

  const foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    review: { $elemMatch: { $eq: reviewId } },
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(400, "No Employee found", "Get Review Error");
  }

  const currentUser = await Employee.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  let foundReview = await Review.findOne({
    _id: reviewId,
    paperworkId: update.paperworkId,
    isDeleted: false,
  });

  if (!foundReview) {
    throw new AppError(400, "Review does not exist", "Get Review Error");
  }

  if (currentUser.role === "Employee") {
    throw new AppError(400, "Invalid Role", "Update Review Error");
  }

  if (currentUser.role === "Manager") {
    if (foundEmployee.lineManager.toString() === userId) {
      if (foundReview.reviewDecision === "Pass") {
        throw new AppError(
          400,
          "Review result was submitted. Please contact admin for adjustment support",
          "Update Review Error"
        );
      }
    } else {
      throw new AppError(
        400,
        "Only employee's line manager can update this review",
        "Update Review Error"
      );
    }
  }

  if (update.reviewDecision !== "Extend") {
    update.extendTime = undefined;
  }

  const updateKeys = Object.keys(update);

  reviewAllowFields.forEach((key) => {
    if (updateKeys.includes(key)) {
      if (req.body[key]) {
        return (foundReview[key] = req.body[key]);
      } else {
        return (foundReview[key] = undefined);
      }
    } else {
      return (foundReview[key] = undefined);
    }
  });

  await foundReview.save();

  sendResponse(res, 200, true, foundReview, null, "Update Review Success");
});

reviewController.shareReview = catchAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  const { companyId } = req;
  const { path } = req.body;

  const filterConditions = { _id: reviewId, isDeleted: false };
  let foundReview = await Review.findOne(filterConditions).populate([
    "reviewer",
    "reviewee",
  ]);

  if (!foundReview)
    throw new AppError(400, "Review does not exists", "Share Review Error");

  if (!foundReview.reviewer.userGenerated || foundReview.reviewer.isDeleted)
    throw new AppError(
      400,
      "Reviewer was not activated or was deleted ",
      "Share Review Error"
    );

  if (foundReview.reviewee.isDeleted)
    throw new AppError(400, "Reviewee was deleted ", "Share Review Error");

  let link = `http://localhost:3000${path}`;
  let email = foundReview.reviewer.email;

  if (!email)
    throw new AppError(400, "Invalid Reviewer's Email ", "Share Review Error");

  const foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    isDeleted: false,
  });

  if (
    !foundEmployee.lineManager ||
    foundEmployee.lineManager.toString() !== foundReview.reviewer._id.toString()
  ) {
    throw new AppError(
      400,
      "Invalid or Unmatch Line Manager ",
      "Share Review Error"
    );
  }

  nodeMailerSending.email({
    revieweeName: foundReview.reviewee.name,
    reviewerName: foundReview.reviewer.name,
    link,
    email,
  });

  sendResponse(res, 200, true, "", null, "Share Review Success");
});

reviewController.deleteReview = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { id, reviewId } = req.params;

  //Remove reviewID from Employee
  const foundEmployee = await Employee.findOne({
    _id: id,
    company: companyId,
    review: { $elemMatch: { $eq: reviewId } },
    isDeleted: false,
  });

  if (!foundEmployee) {
    throw new AppError(
      400,
      "No Employee or Review Found",
      "Delete Review Error"
    );
  } else {
    let reviewIndex = foundEmployee.review.findIndex(
      (review) => review.toString() === reviewId
    );
    foundEmployee.review.splice(reviewIndex, 1);

    await foundEmployee.save();
  }

  //Remove reviewID from Paperwork
  const foundPaperwork = await Paperwork.findOne({
    reviewId,
    isDeleted: false,
  });

  if (!foundPaperwork) {
    throw new AppError(
      400,
      "No Paperwork Related To This Review Found",
      "Delete Review Error"
    );
  } else {
    foundPaperwork.reviewId = undefined;
    await foundPaperwork.save();
  }

  //Delete Review
  let review = await Review.findOneAndDelete({
    _id: reviewId,
    idDeleted: false,
  });

  if (!review) {
    throw new AppError(400, "No Review Found", "Delete Review Error");
  }

  sendResponse(res, 200, true, "", null, "Delete Review Success");
});

module.exports = reviewController;
