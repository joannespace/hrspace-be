const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Company",
    },
    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      default: "Admin",
    },
    generatedBy: { type: mongoose.SchemaTypes.ObjectId, ref: "Employee" },
    activated: { type: Boolean, default: false },
    confirmationCode: { type: String },
    picture: { type: String },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.isDeleted;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.confirmationCode;
  delete user.__v;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign(
    { _id: this._id, _idCompany: this.company._id },
    JWT_SECRET_KEY,
    {
      expiresIn: "8h",
    }
  );
  return accessToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
