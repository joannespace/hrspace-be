const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { formatDate } = require("../helpers/utils");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const employTypes = ["Intern", "Probation", "Full-time", "Part-time"];
const companyDept = [
  "Sales",
  "Marketing",
  "Engineering",
  "Human Resources",
  "Finance",
  "Management",
];
const provinces = [
  "An Giang",
  "Bà Rịa-Vũng Tàu",
  "Bạc Liêu",
  "Bắc Kạn",
  "Bắc Giang",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tây",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hòa Bình",
  "TP. Hồ Chí Minh",
  "Hậu Giang",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lào Cai",
  "Lạng Sơn",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const employeeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      required: true,
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Company",
    },
    password: { type: String },
    onboardDate: { type: Date },
    title: { type: String },
    employmentStatus: {
      type: String,
      enum: ["Active", "Resigned"],
      default: "Active",
    },
    employmentType: { type: String, enum: employTypes },
    department: { type: String, enum: companyDept },
    lineManager: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Employee",
      required: true,
    },
    grossSalary: { type: Number },
    paperwork: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Paperwork",
      },
    ],
    review: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Review",
      },
    ],
    gender: { type: String, enum: ["Male", "Female"] },
    birthday: { type: Date },
    phone: { type: String },
    personalEmail: { type: String },
    permanentAdd: { type: String },
    userGenerated: { type: Boolean, default: false },
    perAddCity: { type: String, enum: provinces },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

employeeSchema.methods.toJSON = function () {
  const employee = this._doc;
  employee.onboardDate = employee.onboardDate?.toString();
  employee.birthday = employee.birthday?.toString();
  delete employee.isDeleted;
  delete employee.createdAt;
  delete employee.updatedAt;
  delete employee.__v;
  return employee;
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
