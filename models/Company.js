const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    companyName: { type: String, unique: true, required: true },
    registerPerson: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    employees: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Employee" }],
    branch: [{ type: mongoose.SchemaTypes.ObjectId, refPath: "Company" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

companySchema.methods.toJSON = function () {
  const company = this._doc;
  delete company.isDeleted;
  delete company.createdAt;
  delete company.updatedAt;
  delete company.__v;
  return company;
};

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
