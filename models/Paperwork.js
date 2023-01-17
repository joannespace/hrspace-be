const mongoose = require("mongoose");

const paperworkSchema = mongoose.Schema(
  {
    paperworkTitle: {
      type: String,
      required: true,
    },
    startDate: { type: Date, required: true },
    lastDate: { type: Date, required: true },
    paperworkType: {
      type: String,
      enum: ["Intern", "Probation", "Full-time", "Part-time"],
      required: true,
    },
    paperworkStatus: {
      type: String,
      enum: ["Pending", "Generated", "Signed"],
      required: true,
    },
    employeeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Review",
    },
    templateId: { type: mongoose.SchemaTypes.ObjectId, ref: "Template" },
    file: { type: Object },
    content: { type: String },
    reviewGenerated: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

paperworkSchema.methods.toJSON = function () {
  const paperwork = this._doc;
  delete paperwork.isDeleted;
  delete paperwork.createdAt;
  delete paperwork.updatedAt;
  delete paperwork.__v;
  return paperwork;
};

const Paperwork = mongoose.model("Paperwork", paperworkSchema);

module.exports = Paperwork;
