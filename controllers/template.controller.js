const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const Template = require("../models/Template");
const User = require("../models/User");
const {
  templateAllowFilters,
  templateAllowFields,
} = require("../config/config");
const { default: mongoose } = require("mongoose");

const templateController = {};

templateController.createNewTemplate = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const data = req.body;

  const currentUser = await User.findOne({
    _id: userId,
    company: companyId,
    isDeleted: false,
  });

  const creationContent = {};
  // let invalidKeys = [];
  // let createKeys = Object.keys(data);

  // createKeys.forEach((key) => {
  //   if (!templateAllowFields.includes(key)) {
  //     invalidKeys = [...invalidKeys, key];
  //   }
  // });

  // if (invalidKeys.length > 0)
  //   throw new AppError(401, "Invalid Field Input", "Create New Template Error");

  templateAllowFields.map((key) => {
    if (key === "creator" && data.creator !== userId) {
      throw new AppError(
        401,
        "Unmatch Creator and Logged-in User",
        "Create New Template Error"
      );
    }

    if (key === "company" && data.company !== currentUser.company.toString()) {
      throw new AppError(
        401,
        "Unmatch User Company",
        "Create New Template Error"
      );
    }

    if (data[key] !== undefined) {
      creationContent[key] = data[key];
    }
  });

  const newTemplate = await Template.create(creationContent);

  sendResponse(
    res,
    200,
    true,
    newTemplate,
    null,
    "Create New Template Success"
  );
});

templateController.getTemplateList = catchAsync(async (req, res, next) => {
  const { companyId } = req;

  let { page, limit, ...filter } = req.query;
  page = parseInt(page) || 0;
  limit = parseInt(limit) || 10;

  let filterCriteria = [{ isDeleted: false }, { company: companyId }];
  // let filterKeys = Object.keys(filter);
  // let invalidKeys = [];

  // filterKeys.forEach((key) => {
  //   if (!templateAllowFilters.includes(key)) {
  //     invalidKeys = [...invalidKeys, key];
  //   }
  // });

  // if (invalidKeys.length > 0)
  //   throw new AppError(401, "Invalid Field Input", "Update Template Error");

  templateAllowFilters.forEach((key) => {
    if (filter[key] !== undefined) {
      if (key === "templateName") {
        filterCriteria.push({
          templateName: { $regex: filter[key], $options: "i" },
        });
      } else {
        filterCriteria = [...filterCriteria, { [key]: { $in: filter[key] } }];
      }
    }
  });

  let filterCondition = { $and: filterCriteria };
  let count = await Template.countDocuments(filterCondition);
  let totalPages = Math.ceil(count / limit);

  let templateList = await Template.find(filterCondition)
    .sort({
      createdAt: -1,
    })
    .populate(["creator", "company"]);

  sendResponse(
    res,
    200,
    true,
    { templateList, totalPages, count },
    null,
    "Get Template List Success"
  );
});

templateController.getSingleTemplate = catchAsync(async (req, res, next) => {
  const { companyId } = req;
  const { templateId } = req.params;

  const filterCriteria = {
    _id: templateId,
    company: companyId,
    isDeleted: false,
  };
  let foundTemplate = await Template.findOne(filterCriteria).populate([
    "creator",
    "company",
  ]);

  if (!foundTemplate)
    throw new AppError(401, "No Template Found", "Get Single Template Error");

  sendResponse(
    res,
    200,
    true,
    foundTemplate,
    null,
    "Get Single Template Success"
  );
});

templateController.updateTemplate = catchAsync(async (req, res, next) => {
  const { userId, companyId } = req;
  const { templateId } = req.params;
  const update = req.body;

  // const currentUser = await User.findOne({
  //   _id: userId,
  //   company: companyId,
  //   isDeleted: false,
  // });

  let foundTemplate = await Template.findOne({
    _id: templateId,
    company: companyId,
    isDeleted: false,
  });

  if (!foundTemplate)
    throw new AppError(
      401,
      "Invalid Template or Invalid Update",
      "Update Template Error"
    );

  // const updateContent = {};
  // let invalidKeys = [];
  let updateKeys = Object.keys(update);

  // updateKeys.forEach((key) => {
  //   if (!templateAllowFields.includes(key)) {
  //     invalidKeys === "_id" ? invalidKeys : [...invalidKeys, key];
  //   }
  // });

  // if (invalidKeys.length > 0)
  //   throw new AppError(401, "Invalid Field Input", "Update Template Error");

  templateAllowFields.forEach((key) => {
    if (key === "creator" && update.creator !== userId) {
      foundTemplate.updator = [
        ...foundTemplate.updator,
        mongoose.Types.ObjectId(userId),
      ];

      // throw new AppError(
      //   401,
      //   "Unmatch Creator and Logged-in User",
      //   "Create New Template Error"
      // );
    }

    if (key === "company" && update.company !== companyId) {
      throw new AppError(
        401,
        "Unmatch Company Field",
        "Create New Template Error"
      );
    }

    if (updateKeys.includes(key)) {
      if (req.body[key]) {
        return (foundTemplate[key] = req.body[key]);
      } else {
        return (foundTemplate[key] = undefined);
      }
    } else {
      return (foundTemplate[key] = undefined);
    }
  });

  await foundTemplate.save();

  sendResponse(res, 200, true, foundTemplate, null, "Update Template Success");
});

templateController.deleteTemplate = catchAsync(async (req, res, next) => {
  const { templateId } = req.params;

  let matchedTemplate = await Template.findByIdAndDelete(templateId);
  if (!matchedTemplate)
    throw new AppError(401, "No Template Found", "Delete Template Error");

  sendResponse(res, 200, true, "", null, "Delete Template Success");
});

module.exports = templateController;
