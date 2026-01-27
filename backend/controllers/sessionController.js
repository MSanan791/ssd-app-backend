const { sequelize, Session, Recording } = require('../models');

exports.finalizeSession = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (!req.files || req.files.length === 0) throw new Error('No audio files');

    const { patientId, sessionDate, finalDiagnosis, notes } = req.body;
    const annotations = JSON.parse(req.body.annotations);

    const newSession = await Session.create({
      patient_id: patientId,
      session_type: 'SSD_Assessment',
      final_session_diagnosis: finalDiagnosis,
      final_session_notes: notes,
      upload_status: 'COMPLETED',
      createdAt: sessionDate || new Date()
    }, { transaction });

    const recordingPayload = req.files.map((file, index) => {
      const note = annotations[index];
      return {
        session_id: newSession.id,
        audio_s3_key: file.key,
        audio_url: file.location,
        word_target: note.targetWord,
        phonetic_transcription: note.transcription,
        error_type: note.errorType,
        is_correct: note.isCorrect === 'true' || note.isCorrect === true,
        is_skipped: false
      };
    });

    await Recording.bulkCreate(recordingPayload, { transaction });
    await transaction.commit();

    res.status(201).json({ message: 'Session finalized', sessionId: newSession.id });
  } catch (err) {
    await transaction.rollback();
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};