const express = require('express');
const router = express.Router();
const { upload } = require('../config/s3');
const authMiddleware = require('../middleware/auth');

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
router.post(
  '/sessions/finalize',
  authMiddleware,
  upload.array('audio_files', 60), 
  sessionController.finalizeSession
);

module.exports = router;