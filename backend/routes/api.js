const express = require('express');
const router = express.Router();
const { upload } = require('../config/s3');
const sessionController = require('../controllers/sessionController');

// Define the Upload Route
// 'audio_files' is the key name React Native must use
router.post(
  '/sessions/finalize',
  upload.array('audio_files', 60), // Allow up to 60 files (buffer for the 52)
  sessionController.finalizeSession
);

// Ensure the last line is:
module.exports = router;