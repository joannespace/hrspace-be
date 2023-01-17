const express = require("express");
const multer = require("multer");

const uploadFile = {};

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    cb(null, req.companyId + "--" + file.originalname);
  },
});

uploadFile.upload = multer({ storage: fileStorageEngine });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./driveFiles");
  },
  filename: (req, file, cb) => {
    cb(null, req.companyId + "--" + file.originalname);
  },
});

uploadFile.uploadDrive = multer({ storage: fileStorage });

module.exports = uploadFile;
