const { Patient, Session, Recording } = require('../models');

exports.getPatients = async (req, res) => {
  try {
    // In real app, use req.user.id from middleware
    const therapistId = req.user ? req.user.id : 1; 
    
    const patients = await Patient.findAll({
      where: { therapist_id: therapistId },
      order: [['createdAt', 'DESC']]
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const therapistId = req.user ? req.user.id : 1;
    
    // Explicitly pull fields to prevent pollution
    const { name, age, gender, primary_language, initial_ssd_type, initial_notes } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender,
      primary_language,
      initial_ssd_type,
      initial_notes,
      therapist_id: therapistId
    });
    
    res.status(201).json(patient);
  } catch (err) {
    console.error("Create Patient Error:", err); // Helpful for debugging on VM
    res.status(500).json({ error: err.message });
  }
};
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { patient_id: req.params.id },
      include: [{ model: Recording, as: 'recordings' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};