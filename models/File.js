const mongoose = require("mongoose");

const fileSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    lastModified: { type: Number, required: true },
    lastModifiedDate: { type: Date, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Types.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
