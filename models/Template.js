const mongoose = require("mongoose");

const templateTypes = ["Intern", "Probation", "Part-time", "Full-time"];

//const emptyFields = ["name", "birthday", "permanentAdd", "employmentType", "phone"]

const templateSchema = mongoose.Schema(
  {
    templateName: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: templateTypes, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    company: { type: mongoose.Types.ObjectId, required: true, ref: "Company" },
    updator: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

templateSchema.methods.toJSON = function () {
  const template = this._doc;
  delete template.isDeleted;
  delete template.updatedAt;
  delete template.__v;
  return template;
};
const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
