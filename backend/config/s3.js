const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Multer Upload Configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // Auto-detect mime type (audio/wav, etc.)
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Naming: recordings/timestamp_uuid.extension
      const ext = path.extname(file.originalname);
      const uniqueName = `recordings/${Date.now()}_${uuidv4()}${ext}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

module.exports = { upload, s3 };