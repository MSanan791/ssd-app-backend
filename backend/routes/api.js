const express = require('express');
const router = express.Router();
const { upload } = require('../config/s3');
const authMiddleware = require('../middleware/auth');
const { Recording } = require('../models');

// Controllers
const authController = require('../controllers/authController');
const patientController = require('../controllers/patientController');
const sessionController = require('../controllers/sessionController');

// --- Auth Routes ---
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// --- Patient Routes (Protected) ---
router.get('/patients', authMiddleware, patientController.getPatients);
router.post('/patients', authMiddleware, patientController.createPatient);
router.get('/patients/:id', authMiddleware, patientController.getPatientById);
router.get('/patients/:id/sessions', authMiddleware, patientController.getPatientSessions);

// --- Session Routes (Protected + File Upload) ---
router.post('/internal/recordings/update-clean', async (req, res) => {
  try {
    const { recording_id, clean_s3_key, clean_url } = req.body;

    await Recording.update({
      clean_audio_s3_key: clean_s3_key,
      clean_audio_url: clean_url,
      is_processed: true
    }, {
      where: { id: recording_id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Failed to update database" });
  }
});
router.post(
  '/sessions/finalize',
  authMiddleware,
  upload.array('audio_files', 60), 
  sessionController.finalizeSession
);

module.exports = router;