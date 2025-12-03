const { sequelize, Session, Recording } = require('../models');

exports.finalizeSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Validation
    if (!req.files || req.files.length === 0) {
      throw new Error('No audio files uploaded.');
    }

    const { patientId, sessionDate, finalDiagnosis, notes } = req.body;
    
    // Parse annotations (Frontend sends stringified JSON)
    let annotations = [];
    try {
      annotations = JSON.parse(req.body.annotations);
    } catch (e) {
      throw new Error('Invalid JSON format for annotations');
    }

    if (req.files.length !== annotations.length) {
      throw new Error(`Mismatch: Received ${req.files.length} files but ${annotations.length} annotations.`);
    }

    // 2. Create Session
    const newSession = await Session.create({
      patient_id: patientId,
      session_type: 'SSD_Assessment',
      final_session_diagnosis: finalDiagnosis,
      final_session_notes: notes,
      upload_status: 'COMPLETED',
      createdAt: sessionDate || new Date()
    }, { transaction });

    // 3. Prepare Bulk Insert Data
    const recordingPayload = req.files.map((file, index) => {
      const note = annotations[index];
      return {
        session_id: newSession.id,
        audio_s3_key: file.key,          // S3 Path
        audio_url: file.location,        // Full S3 URL
        word_target: note.targetWord,
        phonetic_transcription: note.transcription,
        error_type: note.errorType,
        is_correct: note.isCorrect === 'true' || note.isCorrect === true,
        is_skipped: false
      };
    });

    // 4. Save Recordings
    await Recording.bulkCreate(recordingPayload, { transaction });

    // 5. Commit Transaction
    await transaction.commit();

    res.status(201).json({
      message: 'Session finalized successfully',
      sessionId: newSession.id,
      recordingsCount: recordingPayload.length
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Upload Error:", error);
    res.status(500).json({ message: 'Session upload failed', error: error.message });
  }
};