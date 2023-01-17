const mongoose = require("mongoose");

const reviewResults = ["Pending", "Pass", "Extend", "Renew"];

const duration = ["", "1 month", "2 months"];

const reviewSchema = mongoose.Schema(
  {
    reviewTitle: { type: String, required: true },
    reviewer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Employee",
    },
    reviewee: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Employee",
      required: true,
    },

    reviewDate: { type: Date, default: Date.now() },
    paperworkId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Paperwork",
      required: true,
    },
    attitude: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    workQuality: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    reviewDecision: { type: String, enum: reviewResults },
    extendTime: { type: String, enum: duration },
    improvement: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.methods.toJSON = function () {
  const review = this._doc;
  delete review.isDeleted;
  delete review.createdAt;
  delete review.updatedAt;
  delete review.__v;
  return review;
};

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
